import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { fetchActiveProblem, executeCode, notifyAdmin } from './api';
import { useCollaborativeSession } from './hooks/useCollaborativeSession';
import { useCodeTimer } from './hooks/useCodeTimer';
import { useAuth } from './auth/AuthContext';
import ProblemPanel from './components/ProblemPanel';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import WaitingPage from './components/WaitingPage';
import LoginSignupForm from './components/LoginSignupForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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


  const [emailSent, setEmailSent] = useState(false);

  const handleNotify = async () => {
    if (!problem || !output) return alert("Please run the code first.");

    const testCases = output.testCaseResults?.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: tc.actualOutput,
      passed: tc.passed,
    })) || [];

    const success = await notifyAdmin(problem.title, code, testCases);

    if (success) {
      setEmailSent(true);
    } else {
      alert("Failed to send email.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollAmount = 50; // pixels

      if (e.key === 'ArrowDown') {
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


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
              <h1>Welcome to Code Battle!</h1>
              <div className="panel flex-row-between">
                <h3 className="upper-panel-text">Time Elapsed: {finalTime != null ? formatTime(finalTime) : formatTime(elapsedTime)}</h3>
                <h3 className="upper-panel-text">Mode: {pairedMode ? 'Paired' : 'Isolated'}</h3>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 3 }}>
                  <div className="panel">
                    <ProblemPanel problem={problem} />
                  </div>
                  <div className="panel">
                    <CodeEditor code={code} setCode={handleCodeChange} />
                    <button onClick={handleRun} style={{ marginRight: '10px' }}>Run Code</button>
                    <button
                      onClick={handleNotify}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                    >
                      Notify Admin
                    </button>
                    {emailSent && (
                      <p className="mt-2 text-green-600 font-medium">✅ Email sent successfully!</p>
                    )}

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
