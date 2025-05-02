import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { fetchActiveProblem, executeCode } from './api';
import { useCollaborativeSession } from './hooks/useCollaborativeSession';
import { useCodeTimer } from './hooks/useCodeTimer';
import { useAuth } from './auth/AuthContext';
import ProblemPanel from './components/ProblemPanel';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import WaitingPage from './components/WaitingPage';

export default function UserApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [users, setUsers] = useState({});
  const [pairedMode, setPairedMode] = useState(true);

  const {
    startTime,
    elapsedTime,
    finalTime,
    resetTimer,
    setFinalTime,
    startTimer
  } = useCodeTimer();

  const {
    sessionReady,
    syncCode,
    notifySolved,
  } = useCollaborativeSession({
    user,
    problem,
    onCodeMessage: (newCode) => {
      if (pairedMode) setCode(newCode);
    },
    onUsersUpdate: setUsers,
    onProblemEvents: ({ action, paired }) => {
      if (action === 'start') {
        fetchActiveProblem().then((res) => {
          setProblem(res || null);
          setPairedMode(paired);
          resetTimer();
          startTimer();
          if (user?.role !== 'admin') navigate('/problem');
        });
      } else if (action === 'clear') {
        setProblem(null);
        if (user?.role !== 'admin') navigate('/waiting');
      }
    },
    onJoin: () => {
      fetchActiveProblem().then((res) => {
        if (res && res.id) {
          setProblem(res);
          navigate('/problem');
        } else {
          navigate('/waiting');
        }
      });
    },
    setStartTime: startTimer
  });

  useEffect(() => {
    if (problem?.starterCode) {
      setCode(problem.starterCode);
      setPairedMode(problem.paired ?? true); // default to true for backward compatibility
    }
  }, [problem]);


  const handleRun = async () => {
    if (!problem || !code.trim()) return alert('Please write some code before running.');
    const result = await executeCode(problem.id, code);
    setOutput(result);
    const allPassed = result?.testCaseResults?.every(tc => tc.passed);
    if (result.success && allPassed) {
      const time = Math.floor((Date.now() - startTime) / 1000);
      setFinalTime(time);
      notifySolved(time);
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (pairedMode) {
      syncCode(newCode);
    }
  };

  const formatTime = (seconds) =>
    seconds == null || isNaN(seconds)
      ? ''
      : `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;

  return (
    <Routes>
      <Route path="/waiting" element={<WaitingPage users={users} />} />
      <Route
        path="/problem"
        element={
          <div className="App" style={{ padding: '20px' }}>
            <h1>Collaborative Code Platform</h1>
            <div style={{ marginBottom: '10px' }}>
              <h3>
                Time Elapsed: {finalTime != null ? formatTime(finalTime) : formatTime(elapsedTime)}
              </h3>
              <h3>Mode: {pairedMode ? 'Paired Programming' : 'Isolated Editor'}</h3>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 3 }}>
                <ProblemPanel problem={problem} />
                <CodeEditor code={code} setCode={handleCodeChange} />
                <button onClick={handleRun} style={{ marginTop: '10px' }}>Run Code</button>
                <OutputPanel output={output} />
              </div>
              <div
                style={{ flex: 1, border: '1px solid gray', padding: '10px', borderRadius: '8px' }}
              >
                <h3>Participants</h3>
                <ul>
                  {Object.entries(users).map(([sessionId, u]) => {
                    const solved = u?.solved === true;
                    const finalTime = typeof u?.finalTime === 'number' ? u.finalTime : null;

                    return (
                      <li key={sessionId}>
                        {u?.userName || 'Unknown User'}
                        {solved && (
                          <>
                            <span style={{ color: 'green', fontWeight: 'bold' }}> 🏆 SOLVED</span>
                            {finalTime !== null && (
                              <span style={{ marginLeft: '10px', color: 'blue' }}>
                                Time: {formatTime(finalTime)}
                              </span>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/waiting" />} />
    </Routes>
  );
}
