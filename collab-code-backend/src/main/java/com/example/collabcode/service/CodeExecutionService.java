package com.example.collabcode.service;

import com.example.collabcode.model.ExecutionResult;
import com.example.collabcode.model.Problem;
import org.springframework.stereotype.Service;

import javax.tools.*;
import java.io.*;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

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

        // Compile the Java code
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();

        JavaFileObject file = new JavaSourceFromString("Solution", userCode);

        Iterable<? extends JavaFileObject> compilationUnits = List.of(file);
        JavaCompiler.CompilationTask task = compiler.getTask(null, null, diagnostics, null, null, compilationUnits);

        boolean success = task.call();

        if (!success) {
            for (Diagnostic<?> diagnostic : diagnostics.getDiagnostics()) {
                errors.add(diagnostic.getMessage(null));
            }
            result.setSuccess(false);
            result.setErrors(errors);
            return result;
        }

        try {
            // Load and execute compiled class
            InMemoryClassLoader classLoader = new InMemoryClassLoader();
            Class<?> clazz = classLoader.findClass("Solution");
            Method mainMethod = clazz.getMethod("solve", InputStream.class, OutputStream.class);

            Problem problem = problemService.getProblemById(problemId);
            if (problem != null) {
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
                }
            }

            result.setSuccess(true);
            result.setTestCaseResults(testCaseResults);

        } catch (Exception e) {
            errors.add(e.getMessage());
            result.setSuccess(false);
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
