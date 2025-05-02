import React from 'react';

export default function WaitingPage({ users }) {
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

function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} min ${secs} sec`;
}
