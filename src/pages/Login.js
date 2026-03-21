import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo purposes, we'll use a hardcoded admin check
    // The user mentioned "harsatharts9" as the admin name
    if (username === 'harsatharts9' && password === 'admin123') {
      onLogin(true);
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img
            src="/111.png"
            alt="Logo"
            style={{
              width: '150px',
              height: 'auto',
              marginBottom: '0.75rem',
              objectFit: 'contain'
            }}
          />
          <h1>HarsathArts9</h1>
          <p>I am a pencil artist</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group-premium">
            <label htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="username"
                type="text"
                className="login-input-premium"
                placeholder="Enter admin name"
                style={{ paddingLeft: '3rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="password"
                type="password"
                className="login-input-premium"
                placeholder="Enter password"
                style={{ paddingLeft: '3rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn-premium">
            Access Dashboard
          </button>
        </form>

        <div className="login-footer">
          &copy; {new Date().getFullYear()} HarsathArts9 Admin. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
