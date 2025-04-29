import React from 'react';

export default function OutputPanel({ output }) {
  if (!output) return null;

  return (
    <div className="output-panel">
      <h3>Result:</h3>
      {output.success ? (
        <ul>
          {output.testCaseResults.map((res, idx) => (
            <li key={idx}>
              Input: {res.input} | Expected: {res.expectedOutput} | Actual: {res.actualOutput} | 
              {res.passed ? ' ✅' : ' ❌'}
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <h4>Errors:</h4>
          <ul>
            {output.errors.map((e, idx) => <li key={idx}>{e}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
