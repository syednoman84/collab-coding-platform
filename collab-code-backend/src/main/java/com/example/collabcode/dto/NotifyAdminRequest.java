package com.example.collabcode.dto;

import java.util.List;

public class NotifyAdminRequest {
    public String problemTitle;
    public String code;
    public List<TestCaseResult> testCases;

    public static class TestCaseResult {
        public String input;
        public String expectedOutput;
        public String actualOutput;
        public boolean passed;
    }
}
