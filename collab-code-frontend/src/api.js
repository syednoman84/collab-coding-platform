import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchCurrentProblem() {
  const res = await axios.get(`${API_BASE_URL}/problem/current`);
  return res.data;
}

export async function executeCode(problemId, code) {
  const res = await axios.post(
    `${API_BASE_URL}/api/code/execute`,
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
  const res = await fetch(`${API_BASE_URL}/api/questions/active`, { credentials: 'include' });
  if (res.ok) {
    return await res.json();
  }
  return null;
}

export async function notifyAdmin(problemTitle, code, testCases) {
  const res = await fetch(`${API_BASE_URL}/api/notify-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ problemTitle, code, testCases }),
  });

  return res.ok;
}

