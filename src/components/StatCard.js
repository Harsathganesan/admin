import React from 'react';

const StatCard = ({ label, value, icon: Icon, color, gradient }) => {
  return (
    <div className="card stat-card" style={{ 
      position: 'relative', 
      overflow: 'hidden',
      border: `1px solid ${color}20`,
      boxShadow: `0 8px 24px -8px ${color}30`,
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        background: gradient || color,
        opacity: 0.08,
        filter: 'blur(40px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
        <div className="stat-icon" style={{ 
          background: gradient || `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`, 
          color: '#fff',
          boxShadow: `0 8px 20px -4px ${color}40`,
          borderRadius: '12px',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div style={{ marginLeft: '1.2rem' }}>
          <div className="stat-label" style={{ fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', fontSize: '0.75rem' }}>{label}</div>
          <div className="stat-value" style={{ 
            fontSize: '1.85rem', 
            fontWeight: 800,
            background: gradient || color, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            display: 'inline-block' 
          }}>{value}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
