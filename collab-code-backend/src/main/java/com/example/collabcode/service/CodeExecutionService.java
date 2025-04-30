package com.example.collabcode.service;

import com.example.collabcode.model.ExecutionResult;
import com.example.collabcode.model.Problem;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.springframework.stereotype.Service;

import javax.tools.*;
import java.io.*;
import java.lang.reflect.Array;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.*;

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

        Problem problem = problemService.getProblemById(problemId);
        System.out.println("Problem ID received: " + problemId);
        System.out.println("Available IDs: " + problemService.getAllProblems().stream().map(Problem::getId).toList());

        if (problem == null) {
            result.setSuccess(false);
            errors.add("Problem not found.");
            result.setErrors(errors);
            return result;
        }

        String fullSource = userCode;
        JavaFileObject file = new JavaSourceFromString(problem.getClassName(), fullSource);
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        JavaCompiler.CompilationTask task = compiler.getTask(null, null, diagnostics, null, null, List.of(file));

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
            InMemoryClassLoader classLoader = new InMemoryClassLoader();
            Class<?> clazz = classLoader.findClass(problem.getClassName());

            Object instance = clazz.getDeclaredConstructor().newInstance();

            Class<?>[] paramTypes = parseParameterTypes(problem.getParameters());
            Method method = clazz.getMethod(problem.getMethodName(), paramTypes);

            for (Problem.TestCase testCase : problem.getTestCases()) {
                Object[] args = parseArguments(testCase.getInput(), problem.getParameters());

                if (args.length != paramTypes.length) {
                    throw new IllegalArgumentException("Expected " + paramTypes.length + " arguments but got " + args.length);
                }

                Object actual = method.invoke(instance, args);

                String actualOutput = serializeOutput(actual);
                boolean passed;

                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode expectedJson = mapper.readTree(testCase.getExpectedOutput());
                    JsonNode actualJson = mapper.readTree(actualOutput);
                    passed = expectedJson.equals(actualJson);
                } catch (Exception e) {
                    passed = testCase.getExpectedOutput().trim().equals(actualOutput.trim());
                }


                ExecutionResult.TestCaseResult tc = new ExecutionResult.TestCaseResult();
                tc.setInput(testCase.getInput());
                tc.setExpectedOutput(testCase.getExpectedOutput());
                tc.setActualOutput(actualOutput);
                tc.setPassed(passed);

                testCaseResults.add(tc);
            }

            result.setSuccess(true);
            result.setTestCaseResults(testCaseResults);

        } catch (Exception e) {
            e.printStackTrace();
            errors.add("Execution failed: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            result.setSuccess(false);
            result.setErrors(errors);
        }

        return result;
    }

    private Class<?>[] parseParameterTypes(List<String> paramDefs) throws ClassNotFoundException {
        List<Class<?>> types = new ArrayList<>();
        for (String def : paramDefs) {
            String typeOnly = def.trim().split("\\s+")[0];
            switch (typeOnly) {
                case "int" -> types.add(int.class);
                case "int[]" -> types.add(int[].class);
                case "String" -> types.add(String.class);
                case "String[]" -> types.add(String[].class);
                case "double" -> types.add(double.class);
                case "double[]" -> types.add(double[].class);
                case "boolean" -> types.add(boolean.class);
                case "List<Integer>", "List<String>" -> types.add(List.class);
                case "Map<String,Integer>" -> types.add(Map.class);
                default -> throw new IllegalArgumentException("Unsupported param type: " + typeOnly);
            }
        }
        return types.toArray(new Class<?>[0]);
    }

    private Object[] parseArguments(String jsonInput, List<String> paramDefs) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode inputArray = mapper.readTree(jsonInput);

        if (!inputArray.isArray()) {
            throw new IllegalArgumentException("Input must be a JSON array of arguments.");
        }

        if (inputArray.size() != paramDefs.size()) {
            throw new IllegalArgumentException("Expected " + paramDefs.size() + " arguments, but got " + inputArray.size());
        }

        Object[] args = new Object[paramDefs.size()];

        for (int i = 0; i < paramDefs.size(); i++) {
            String typeOnly = paramDefs.get(i).trim().split("\\s+")[0];
            JsonNode argNode = inputArray.get(i);

            switch (typeOnly) {
                case "int[]" -> {
                    List<Integer> intList = mapper.convertValue(argNode, new TypeReference<List<Integer>>() {});
                    args[i] = intList.stream().mapToInt(Integer::intValue).toArray();
                }
                case "double[]" -> {
                    List<Double> dblList = mapper.convertValue(argNode, new TypeReference<List<Double>>() {});
                    args[i] = dblList.stream().mapToDouble(Double::doubleValue).toArray();
                }
                case "String[]" -> {
                    List<String> strList = mapper.convertValue(argNode, new TypeReference<List<String>>() {});
                    args[i] = strList.toArray(new String[0]);
                }
                case "List<Integer>" -> args[i] = mapper.convertValue(argNode, TypeFactory.defaultInstance().constructCollectionType(List.class, Integer.class));
                case "List<String>" -> args[i] = mapper.convertValue(argNode, TypeFactory.defaultInstance().constructCollectionType(List.class, String.class));
                case "Map<String,Integer>" -> args[i] = mapper.convertValue(argNode, TypeFactory.defaultInstance().constructMapType(Map.class, String.class, Integer.class));
                case "int" -> args[i] = mapper.treeToValue(argNode, int.class);
                case "double" -> args[i] = mapper.treeToValue(argNode, double.class);
                case "boolean" -> args[i] = mapper.treeToValue(argNode, boolean.class);
                case "String" -> args[i] = mapper.treeToValue(argNode, String.class);
                default -> args[i] = mapper.treeToValue(argNode, Object.class);
            }
        }

        return args;
    }

    private String serializeOutput(Object result) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(result);
    }

    private String normalizeJsonString(String json) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode normalized = mapper.readTree(json);
        return mapper.writeValueAsString(normalized);
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
