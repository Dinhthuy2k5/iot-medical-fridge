import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('jwt_token');
    }
  }, [token]);

  // Set header ngay tại đây, trước khi render
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return <Dashboard onLogout={() => setToken('')} />;
}

export default App;