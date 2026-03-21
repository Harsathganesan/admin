import React from 'react';
import { Mail, User, Clock, MessageSquare } from 'lucide-react';

const Feedbacks = ({ feedbacks }) => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.875rem' }}>Customer Feedbacks</h1>

      <div className="feedback-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {Array.isArray(feedbacks) && feedbacks.map((fb) => (
          <div key={fb._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <User size={18} color="#818cf8" />
                {fb.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                <Clock size={14} />
                {new Date(fb.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', wordBreak: 'break-all' }}>
              <Mail size={16} style={{ flexShrink: 0 }} />
              {fb.email}
            </div>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1.2rem 1rem 1rem 1rem', 
              borderRadius: 'var(--radius)', 
              fontSize: '0.925rem',
              lineHeight: '1.5',
              position: 'relative',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              border: '1px solid #e2e8f0',
              color: '#475569'
            }}>
              <MessageSquare size={16} style={{ position: 'absolute', top: '-8px', left: '10px', color: '#4f46e5', background: 'white', borderRadius: '50%', padding: '2px' }} />
              "{fb.message}"
            </div>
          </div>
        ))}

        {feedbacks.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            No feedbacks found in database.
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedbacks;
