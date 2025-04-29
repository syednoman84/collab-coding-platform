package com.example.collabcode.service;

import com.example.collabcode.model.ExecutionResult;
import com.example.collabcode.model.Problem;
import org.springframework.stereotype.Service;

import javax.tools.*;
import java.io.*;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CodeExecutionService {

    private final ProblemService problemService;

    public CodeExecutionService(ProblemService problemService) {
        this.problemService = problemService;
    }

    public ExecutionResult executeCode(int problemId, String userCode) {
        ExecutionResult result = new ExecutionResult();
        List<ExecutionResult.TestCaseResult> testCaseResults = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        StandardJavaFileManager stdFileManager = compiler.getStandardFileManager(diagnostics, null, null);
        MemoryJavaFileManager fileManager = new MemoryJavaFileManager(stdFileManager);

        JavaFileObject file = new JavaSourceFromString("Solution", userCode);
        boolean success = compiler.getTask(null, fileManager, diagnostics, null, null, List.of(file)).call();

        if (!success) {
            for (Diagnostic<?> diagnostic : diagnostics.getDiagnostics()) {
                errors.add(diagnostic.getMessage(null));
            }
            result.setSuccess(false);
            result.setErrors(errors);
            return result;
        }

        try {
            ClassLoader classLoader = fileManager.getClassLoader(null);
            Class<?> clazz = classLoader.loadClass("Solution");
            Method mainMethod = clazz.getMethod("solve", InputStream.class, OutputStream.class);

            Problem problem = problemService.getProblemById(problemId);
            if (problem != null) {
                System.out.println("Loaded problem: " + problem.getTitle());
                System.out.println("Test cases count: " + (problem.getTestCases() != null ? problem.getTestCases().size() : 0));

                for (Problem.TestCase testCase : problem.getTestCases()) {
                    ByteArrayInputStream inputStream = new ByteArrayInputStream(testCase.getInput().getBytes());
                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                    mainMethod.invoke(null, inputStream, outputStream);

                    String actualOutput = outputStream.toString().trim();
                    boolean passed = actualOutput.equals(testCase.getExpectedOutput());

                    ExecutionResult.TestCaseResult testCaseResult = new ExecutionResult.TestCaseResult();
                    testCaseResult.setInput(testCase.getInput());
                    testCaseResult.setExpectedOutput(testCase.getExpectedOutput());
                    testCaseResult.setActualOutput(actualOutput);
                    testCaseResult.setPassed(passed);

                    testCaseResults.add(testCaseResult);
                    System.out.println("Ran input: " + testCase.getInput() + ", got: " + actualOutput);

                }
            }

            result.setSuccess(true);
            result.setTestCaseResults(testCaseResults);
        } catch (Exception e) {
            result.setSuccess(false);
            errors.add(e.getMessage());
            result.setErrors(errors);
        }

        return result;
    }


    // Helper classes
    static class JavaSourceFromString extends SimpleJavaFileObject {
        final String code;

        JavaSourceFromString(String name, String code) {
            super(URI.create("string:///" + name.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
            this.code = code;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return code;
        }
    }

    static class InMemoryClassLoader extends ClassLoader {
        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            try {
                File file = new File(name + ".class");
                byte[] bytes = new byte[(int) file.length()];
                FileInputStream fis = new FileInputStream(file);
                fis.read(bytes);
                fis.close();
                return defineClass(name, bytes, 0, bytes.length);
            } catch (IOException e) {
                throw new ClassNotFoundException(name);
            }
        }
    }
}

class MemoryJavaFileManager extends ForwardingJavaFileManager<JavaFileManager> {
    private final Map<String, ByteArrayOutputStream> classBytes = new HashMap<>();

    MemoryJavaFileManager(JavaFileManager fileManager) {
        super(fileManager);
    }

    @Override
    public JavaFileObject getJavaFileForOutput(Location location, String className, JavaFileObject.Kind kind, FileObject sibling) {
        return new SimpleJavaFileObject(URI.create("mem:///" + className + kind.extension), kind) {
            @Override
            public OutputStream openOutputStream() {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                classBytes.put(className, baos);
                return baos;
            }
        };
    }

    @Override
    public ClassLoader getClassLoader(Location location) {
        return new ClassLoader() {
            @Override
            protected Class<?> findClass(String name) {
                byte[] bytes = classBytes.get(name).toByteArray();
                return defineClass(name, bytes, 0, bytes.length);
            }
        };
    }
}
