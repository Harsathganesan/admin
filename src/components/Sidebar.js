import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Settings, MessageSquare, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout, mobileMenuOpen, setMobileMenuOpen, orders = [], feedbacks = [] }) => {
  const location = useLocation();
  const [seenFeedbacks, setSeenFeedbacks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('seenFeedbacks')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (location.pathname === '/feedbacks' && feedbacks.length > 0) {
      const ids = feedbacks.map(fb => fb._id);
      localStorage.setItem('seenFeedbacks', JSON.stringify(ids));
      setSeenFeedbacks(ids);
    }
  }, [location.pathname, feedbacks]);

  const hasPendingOrders = Array.isArray(orders) && orders.some(order => order.status === 'Pending');
  const hasUnreadFeedbacks = Array.isArray(feedbacks) && feedbacks.some(fb => !seenFeedbacks.includes(fb._id));

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
            {hasPendingOrders && <span className="notification-dot" title="Pending Orders Available" />}
          </NavLink>

          <NavLink to="/feedbacks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            <MessageSquare size={20} />
            <span>Feedbacks</span>
            {hasUnreadFeedbacks && <span className="notification-dot" title="New Feedbacks Available" />}
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
