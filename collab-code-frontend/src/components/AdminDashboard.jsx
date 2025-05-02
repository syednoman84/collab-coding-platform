import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/problem/all`)
      .then((res) => setProblems(res.data))
      .catch(console.error);
  }, []);

  const handleSelectProblem = (problemId) => {
    axios.post(`${API_BASE_URL}/api/admin/selectProblem`, { problemId })
      .then(() => alert('Problem started!'))
      .catch(console.error);
  };

  const handleClearProblem = () => {
    axios.post(`${API_BASE_URL}/api/admin/clearProblem`)
      .then(() => alert('Problem cleared!'))
      .catch(console.error);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <button onClick={handleClearProblem} style={{ marginBottom: '20px' }}>Clear Active Problem</button>
      <h3>Available Problems</h3>
      <ul>
        {problems.map((p) => (
          <li key={p.id} style={{ marginBottom: '10px' }}>
            <strong>{p.title}</strong> <br />
            <small>{p.description}</small> <br />
            <button onClick={() => handleSelectProblem(p.id)}>Select This Problem</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
