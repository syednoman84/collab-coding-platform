import React from 'react';

export default function ProblemPanel({ problem }) {
  if (!problem) return null;
  
  return (
    <div className="problem-panel">
      <h2>{problem.title}</h2>
      <p>{problem.description}</p>
    </div>
  );
}
