import { useEffect, useState } from 'react';
import { fetchActiveProblem, executeCode } from './api';
import { connectWebSocket, sendCodeSync, sendUserJoin, sendUserSolved } from './websocket';
import ProblemPanel from './components/ProblemPanel';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import { useAuth } from './auth/AuthContext';

export default function UserApp() {
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [users, setUsers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [pairedMode, setPairedMode] = useState(true); // default to true for backward compatibility


  useEffect(() => {
    if (!user) return;

    fetchActiveProblem().then((res) => setProblem(res || null));

    connectWebSocket(handleCodeMessage, handleUsersUpdate, handleProblemEvents).then(() => {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem('sessionId', sessionId);
      }
      console.log("Sending user join:", user.username);
      sendUserJoin(user.username, problem ? problem.id : null);
      setStartTime(Date.now());
    });
  }, [user]);

  useEffect(() => {
    const interval = startTime
      ? setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000)
      : null;
    return () => interval && clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (problem?.starterCode) setCode(problem.starterCode);
  }, [problem]);

  const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

  const handleCodeMessage = (newCode) => {
    if (pairedMode) {
      setCode(newCode);
    }
  };

  const handleUsersUpdate = (userList) => {
    console.log("Received users:", userList);
    setUsers(userList)
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (pairedMode) {
      sendCodeSync(newCode);
    }
  };


  const handleProblemEvents = ({ action, paired }) => {
    if (action === 'start') {
      fetchActiveProblem().then((res) => {
        setProblem(res || null);
        setStartTime(Date.now());
        setElapsedTime(0);
        setFinalTime(null);
        setPairedMode(paired); // 👈 save paired flag from server
      });
    } else if (action === 'clear') {
      setProblem(null);
    }
  };


  const handleRun = async () => {
    if (!problem || !code.trim()) return alert('Please write some code before running.');
    const result = await executeCode(problem.id, code);
    setOutput(result);
    const allPassed = result?.testCaseResults?.every(tc => tc.passed);
    if (result.success && allPassed) {
      const time = Math.floor((Date.now() - startTime) / 1000);
      sendUserSolved(time);
      setFinalTime(time);
    }
  };

  const formatTime = (seconds) =>
    seconds == null || isNaN(seconds)
      ? ''
      : `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;

  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>Collaborative Code Platform</h1>
      {!problem ? (
        <>
          <h2>Waiting for admin to start a problem...</h2>
          <p>Please stay connected. The admin will activate a coding challenge shortly!</p>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
            <h3>Time Elapsed: {finalTime != null ? formatTime(finalTime) : formatTime(elapsedTime)}</h3>
            <h3>
              Mode: {pairedMode ? 'Paired Programming' : 'Isolated Editor'}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 3 }}>
              <ProblemPanel problem={problem} />
              <CodeEditor code={code} setCode={handleCodeChange} />
              <button onClick={handleRun} style={{ marginTop: '10px' }}>Run Code</button>
              <OutputPanel output={output} />
            </div>
            <div style={{ flex: 1, border: '1px solid gray', padding: '10px', borderRadius: '8px' }}>
              <h3>Participants</h3>
              <ul>
                {Object.entries(users).map(([sessionId, u]) => (
                  <li key={sessionId}>
                    {u.userName}
                    {u.solved && (
                      <>
                        <span style={{ color: 'green', fontWeight: 'bold' }}> 🏆 SOLVED</span>
                        {u.finalTime != null && (
                          <span style={{ marginLeft: '10px', color: 'blue' }}>
                            Time: {formatTime(u.finalTime)}
                          </span>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
