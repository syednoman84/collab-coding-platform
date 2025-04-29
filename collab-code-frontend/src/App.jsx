import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { fetchCurrentProblem, fetchActiveProblem, executeCode } from './api';
import { connectWebSocket, sendCodeSync, sendUserJoin, sendUserSolved } from './websocket';
import ProblemPanel from './components/ProblemPanel';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserWaitingPage from './components/UserWaitingPage';
import AdminQuestionManager from './components/AdminQuestionManager';


function UserApp() {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState({});
  const [joined, setJoined] = useState(false);

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(null);


  useEffect(() => {
    fetchActiveProblem().then((res) => {
      if (!res || Object.keys(res).length === 0) {
        setProblem(null);
      } else {
        setProblem(res);
      }
    });
    connectWebSocket(handleCodeMessage, handleUsersUpdate, handleProblemEvents);
  }, []);

  useEffect(() => {
    let interval = null;
    if (startTime) {
      // console.log("Timer useEffect triggered with startTime:", startTime);
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        // console.log("Timer tick:", seconds);
        setElapsedTime(seconds);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime]);

  useEffect(() => {
    if (problem && problem.starterCode) {
      setCode(problem.starterCode);
    } else {
      setCode('');
    }
  }, [problem]);

  const handleCodeMessage = (newCode) => setCode(newCode);

  const handleUsersUpdate = (userList) => {
    console.log("Received users update:", userList); // ✅ Add this
    setUsers(userList);
  };

  const handleProblemEvents = (payload) => {
    console.log('Received problem event from WebSocket:', payload);
    
    if (payload.action === 'start') {
      fetchActiveProblem().then((res) => {
        if (!res || Object.keys(res).length === 0) {
          setProblem(null);
        } else {
          setProblem(res);           // ✅ Set fetched problem
          setStartTime(Date.now());   // ✅ Reset timer to now
          setElapsedTime(0);          // ✅ Reset elapsed seconds
          setFinalTime(null);         // ✅ Clear final time
        }
      });
    }
    
    if (payload.action === 'clear') {
      setProblem(null);
    }
  };


  const handleJoin = () => {
    if (userName.trim() !== '') {
      const sessionId = generateUUID();
      sessionStorage.setItem('sessionId', sessionId);

      sendUserJoin(userName.trim(), problem ? problem.id : null);

      setJoined(true);
      const now = Date.now();
      setStartTime(now);
    }
  };

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  const handleRun = async () => {
    if (!problem || code.trim() === '') {
      alert('Please write some code before running.');
      return;
    }

    const result = await executeCode(problem.id, code);
    setOutput(result);

    const allPassed = result?.testCaseResults?.length > 0 &&
      result.testCaseResults.every(tc => tc.passed);

    if (result.success && allPassed) {
      const time = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;

      sendUserSolved(time);       // ✅ Pass the time to backend
      setFinalTime(time);         // ✅ Store locally for current user
    }
  };



  const handleCodeChange = (newCode) => {
    setCode(newCode);
    sendCodeSync(newCode);
  };

  function formatTime(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  }


  // User has NOT joined yet
  if (!joined) {
    return (
      <div className="App" style={{ padding: '20px' }}>
        <h1>Join the Coding Challenge</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button onClick={handleJoin} style={{ marginLeft: '10px' }}>Join</button>
      </div>
    );
  }

  // User has joined but problem is not active
  if (joined && problem === null) {
    return (
      <div className="App" style={{ padding: '20px' }}>
        <h2>Waiting for admin to start a problem...</h2>
        <p>Please stay connected. The admin will activate a coding challenge shortly!</p>

        <h3>Participants</h3>
        <ul>
          {Object.entries(users).map(([sessionId, user]) => (
            <li key={sessionId}>
              {user.userName}
              {user.solved && (
                <>
                  <span style={{ color: 'green', fontWeight: 'bold' }}> 🏆 SOLVED</span>
                  {user.finalTime !== null && (
                    <span style={{ marginLeft: '10px', color: 'blue' }}>
                      Time: {formatTime(user.finalTime)}
                    </span>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // User has joined AND problem is active
  if (joined && problem !== null) {
    return (      
      <div className="App" style={{ padding: '20px' }}>
        <h1>Collaborative Code Platform</h1>

        {/* ✅ TIMER BLOCK */}
        <div style={{ marginBottom: '10px' }}>
          <h3>
            Time Elapsed:{' '}
            {finalTime !== null ? formatTime(finalTime) : formatTime(elapsedTime)}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 3 }}>
            <ProblemPanel problem={problem} />
            <CodeEditor code={code} setCode={handleCodeChange} />
            <button onClick={handleRun} style={{ marginTop: '10px' }}>
              Run Code
            </button>
            <OutputPanel output={output} />
          </div>

          <div
            style={{
              flex: 1,
              border: '1px solid gray',
              padding: '10px',
              borderRadius: '8px',
            }}
          >
            <h3>Participants</h3>
            <ul>
              {Object.entries(users).map(([sessionId, user]) => (
                <li key={sessionId}>
                  {user.userName}
                  {user.solved && (
                    <>
                      <span style={{ color: 'green', fontWeight: 'bold' }}> 🏆 SOLVED</span>
                      {user.finalTime !== null && (
                        <span style={{ marginLeft: '10px', color: 'blue' }}>
                          Time: {formatTime(user.finalTime)}
                        </span>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/*" element={<UserApp />} />
        <Route path="/admin/questions" element={<AdminQuestionManager />} />
      </Routes>
    </Router>
  );
}
