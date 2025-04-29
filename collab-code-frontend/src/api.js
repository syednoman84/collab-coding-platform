import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.196:8080/api';

export async function fetchCurrentProblem() {
  const res = await axios.get(`${API_BASE_URL}/problem/current`);
  return res.data;
}

export async function executeCode(problemId, code) {
  const res = await axios.post(`${API_BASE_URL}/code/execute`, {
    problemId,
    code
  });
  return res.data;
}

export async function fetchActiveProblem() {
    const res = await axios.get(`${API_BASE_URL}/problem/active`);
    return res.data;
  }
  
