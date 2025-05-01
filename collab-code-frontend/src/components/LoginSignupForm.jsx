import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'; 

export default function LoginSignupForm() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = isSignup
      ? await signup(username, password)
      : await login(username, password);
  
    if (!user) {
      setError('Authentication failed. Please try again.');
    } else {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };
  

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%' }}>
          {isSignup ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      <button
        onClick={() => setIsSignup(!isSignup)}
        style={{ marginTop: '10px', width: '100%' }}
      >
        {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
