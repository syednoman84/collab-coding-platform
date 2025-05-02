import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      return data; // ✅ return user info
    }
    return null;
  };

  const signup = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      return data;
    }
    return null;
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
