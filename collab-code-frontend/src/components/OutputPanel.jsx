import React from 'react';

export default function OutputPanel({ output }) {
  if (!output) return null;

  const successStyle = { color: 'green', fontWeight: 'bold' };
  const failStyle = { color: 'red', fontWeight: 'bold' };

  const highlightDiff = (expected, actual) => {
    if (expected === actual) return actual;
    let output = '';
    const len = Math.max(expected.length, actual.length);
    for (let i = 0; i < len; i++) {
      const e = expected[i] || '';
      const a = actual[i] || '';
      if (e !== a) {
        output += `<span style="background-color: yellow; color: red;">${a}</span>`;
      } else {
        output += a;
      }
    }
    return output;
  };

  if (output.success) {
    const total = output.testCaseResults.length;
    const passed = output.testCaseResults.filter(r => r.passed).length;
    const failed = total - passed;

    return (
      <div className="output-panel" style={{ marginTop: '20px' }}>
        <h3>
          Test Cases: &emsp; ✅ Passed {passed} &emsp;&emsp; ❌ Failed {failed}
        </h3>

        <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Input</th>
                <th style={thStyle}>Expected</th>
                <th style={thStyle}>Actual</th>
                <th style={thStyle}>Result</th>
              </tr>
            </thead>
            <tbody>
              {output.testCaseResults.map((res, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{res.input}</td>
                  <td style={tdStyle}>{res.expectedOutput}</td>
                  <td style={tdStyle}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightDiff(res.expectedOutput, res.actualOutput),
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    {res.passed ? (
                      <span style={successStyle}>✅ Passed</span>
                    ) : (
                      <span style={failStyle}>❌ Failed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffe6e6', padding: '10px', border: '1px solid red', marginTop: '20px' }}>
      <h4 style={{ color: 'red' }}>Errors:</h4>
      <ul>
        {output.errors?.length ? output.errors.map((e, idx) => <li key={idx}>{e}</li>) : <li>No specific error messages.</li>}
      </ul>
    </div>
  );
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left'
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '8px'
};
