import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.196:8080/api';

export async function fetchCurrentProblem() {
  const res = await axios.get(`${API_BASE_URL}/problem/current`);
  return res.data;
}

export async function executeCode(problemId, code) {
    const res = await axios.post(
      'http://192.168.1.196:8080/api/code/execute',
      { problemId, code }, 
      {
        withCredentials: true, 
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data;
  }
  

// export async function fetchActiveProblem() {
//     const res = await axios.get(`${API_BASE_URL}/problem/active`);
//     return res.data;
//   }

  export async function fetchActiveProblem() {
    const res = await fetch(`${API_BASE_URL}/questions/active`, {credentials: 'include'});
    if (res.ok) {
      return await res.json();
    }
    return null;
  }
  
  
