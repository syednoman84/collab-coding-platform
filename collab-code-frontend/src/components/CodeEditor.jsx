import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, setCode }) {
  return (
    <Editor
      height="400px"
      defaultLanguage="java"
      value={code}
      onChange={(value) => setCode(value)}
    />
  );
}
