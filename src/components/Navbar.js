import React, { useState, useEffect, useRef } from 'react';
import { User, Menu, Mail, MapPin } from 'lucide-react';

const Navbar = ({ toggleMobileMenu }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-main)',
            padding: '0.25rem',
            display: 'none' /* hidden by default, shown in mobile CSS */
          }}
        >
          <Menu size={24} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>HarsathArts9</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }} ref={profileRef}>
        <div
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          style={{
            display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer',
            background: isProfileOpen ? '#f1f5f9' : 'transparent', padding: '0.3rem 0.5rem', borderRadius: '8px', transition: '0.2s'
          }}
        >
          <User size={20} />
        </div>

        {isProfileOpen && (
          <div style={{
            position: 'absolute',
            top: '40px',
            right: '0',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            width: '260px',
            zIndex: 1000,
            color: 'var(--text-main)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <img src="/111.png" alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #e2e8f0', padding: '2px', background: 'white', objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Harsath</h3>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, background: '#d1fae5', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>Artist / Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '8px' }}>
                  <Mail size={16} color="#6366f1" />
                </div>
                harsatharts2005@gmail.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '8px' }}>
                  <MapPin size={16} color="#ec4899" />
                </div>
                Tamil Nadu, India
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
