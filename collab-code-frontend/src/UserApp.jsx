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
import LoginSignupForm from './components/LoginSignupForm';

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
          setOutput(null);
          resetTimer();
          startTimer();
          if (user?.role !== 'admin') navigate('/problem');
        });
      }
      else if (action === 'clear') {
        setProblem(null);
        setOutput(null); // ✅ Clear output when problem is cleared
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
      setPairedMode(problem.paired ?? true);
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
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={problem ? '/problem' : '/waiting'} replace />
          ) : (
            <LoginSignupForm />
          )
        }
      />
      <Route path="/waiting" element={<WaitingPage users={users} />} />
      <Route
        path="/problem"
        element={
          problem ? (
<div className="App">
  <h1>Collaborative Code Platform</h1>
  <div className="panel">
    <h3>Time Elapsed: {finalTime != null ? formatTime(finalTime) : formatTime(elapsedTime)}</h3>
    <h3>Mode: {pairedMode ? 'Paired Programming' : 'Isolated Editor'}</h3>
  </div>
  <div style={{ display: 'flex', gap: '20px' }}>
    <div style={{ flex: 3 }}>
      <div className="panel">
        <ProblemPanel problem={problem} />
      </div>
      <div className="panel">
        <CodeEditor code={code} setCode={handleCodeChange} />
        <button onClick={handleRun}>Run Code</button>
        <OutputPanel output={output} />
      </div>
    </div>
    <div className="participants" style={{ flex: 1 }}>
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
                  <span className="solved"> 🏆 SOLVED</span>
                  {finalTime !== null && (
                    <span className="time">Time: {formatTime(finalTime)}</span>
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

          ) : (
            <Navigate to="/waiting" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/waiting" />} />
    </Routes>
  );
}
