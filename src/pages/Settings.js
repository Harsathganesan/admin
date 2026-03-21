import React, { useState, useEffect } from 'react';
import { Lock, Server, CheckCircle, XCircle } from 'lucide-react';

const Settings = () => {
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5005/api/orders`);
        if (res.ok) {
          setServerStatus('Online');
          setDbStatus('Connected');
        } else {
          setServerStatus('Issue Detected');
        }
      } catch (e) {
        setServerStatus('Offline');
        setDbStatus('Disconnected');
      }
    };
    checkServer();
  }, []);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // For demo purposes, we'll just show a success message
    setMsg('Password update feature coming soon!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', paddingBottom: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: 800 }}>Settings</h1>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Server Check Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Server color="var(--primary)" size={isMobile ? 20 : 24} />
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: 800 }}>Server & Database Status</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
              <span style={{ fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>Backend Server</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: serverStatus === 'Online' ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1rem' }}>
                {serverStatus === 'Online' ? <CheckCircle size={isMobile ? 16 : 18} /> : <XCircle size={isMobile ? 16 : 18} />}
                {serverStatus}
              </span>
            </div>
            
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
              <span style={{ fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem' }}>MongoDB Database</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: dbStatus === 'Connected' ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1rem' }}>
                {dbStatus === 'Connected' ? <CheckCircle size={isMobile ? 16 : 18} /> : <XCircle size={isMobile ? 16 : 18} />}
                {dbStatus}
              </span>
            </div>
          </div>
          
          <button 
            className="btn btn-outline" 
            style={{ marginTop: '1.5rem', width: '100%', borderRadius: '12px', padding: '0.8rem' }}
            onClick={() => window.location.reload()}
          >
            Refresh Status
          </button>
        </div>

        {/* Password Change Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Lock color="var(--secondary)" size={isMobile ? 20 : 24} />
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', fontWeight: 800 }}>Change Admin Password</h2>
          </div>
          
          <form onSubmit={handlePasswordChange}>
            <div className="form-group-premium" style={{ marginBottom: '1.25rem' }}>
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" className="login-input-premium" disabled />
            </div>
            <div className="form-group-premium" style={{ marginBottom: '1.5rem' }}>
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password" 
                className="login-input-premium" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            {msg && <div style={{ color: 'var(--primary)', marginBottom: '1.2rem', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>{msg}</div>}
            
            <button type="submit" className="login-btn-premium" style={{ width: '100%' }}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
