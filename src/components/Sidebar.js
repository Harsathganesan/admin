import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Settings, MessageSquare, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/111.png" alt="Logo" style={{ width: '40px', height: 'auto', borderRadius: '8px', background: '#fff', padding: '2px' }} />
          <span>HarsathArts9</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={() => setMobileMenuOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={20} />
            <span>Orders</span>
          </NavLink>

          <NavLink to="/feedbacks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <MessageSquare size={20} />
            <span>Feedbacks</span>
          </NavLink>


          
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button 
            onClick={onLogout}
            className="nav-item logout-item" 
            style={{ width: '100%', background: 'transparent' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
