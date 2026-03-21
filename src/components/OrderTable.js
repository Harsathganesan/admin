import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Phone, Mail } from 'lucide-react';

const OrderTable = ({ orders, onUpdateStatus, showActions = true }) => {
  const navigate = useNavigate();


  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="badge badge-pending">Pending</span>;
      case 'Accepted': return <span className="badge badge-accepted">Accepted</span>;
      case 'Declined': return <span className="badge badge-declined">Declined</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <>
      {/* Desktop Table - hidden on mobile */}
      <div className="table-container desktop-only">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Type/Size</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.map((order) => (
              <tr key={order._id}>
                <td style={{ fontWeight: 600, color: '#818cf8', fontSize: '0.75rem' }}>
                  {order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customerEmail}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                    <Phone size={14} color="#94a3b8" /> {order.customerPhone}
                  </div>
                </td>
                <td>
                  <div>{order.drawingType}</div>
                  <div className="badge" style={{ background: '#f1f5f9', color: '#64748b', padding: '0.1rem 0.5rem', marginTop: '0.2rem' }}>{order.size}</div>
                </td>
                <td>₹{order.price}</td>
                <td>{getStatusBadge(order.status || 'Pending')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-outline" 
                      title="View Details"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <Eye size={16} />
                    </button>
                    
                    {showActions && (order.status === 'Pending' || !order.status) && (
                      <>
                        <button 
                          className="btn btn-success" 
                          title="Accept"
                          onClick={() => onUpdateStatus(order._id, 'Accepted')}
                          style={{ padding: '0.4rem' }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          title="Decline"
                          onClick={() => onUpdateStatus(order._id, 'Declined')}
                          style={{ padding: '0.4rem' }}
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No orders found in MongoDB.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - hidden on desktop */}
      <div className="mobile-only">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.isArray(orders) && orders.map((order) => (
            <div 
              key={order._id} 
              style={{ 
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {order.customerName}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem', color: '#818cf8' }}>
                    {order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}
                  </div>
                </div>
                {getStatusBadge(order.status || 'Pending')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <Mail size={14} color="#94a3b8" />
                  <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.customerEmail}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                  <Phone size={14} color="#94a3b8" />
                  <span style={{ color: 'var(--text-muted)' }}>{order.customerPhone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.6rem' }}>
                    {order.drawingType} ({order.size})
                  </span>
                  <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>₹{order.price}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.25rem' }}>
                {showActions && (order.status === 'Pending' || !order.status) && (
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button 
                      className="btn btn-success" 
                      onClick={() => onUpdateStatus(order._id, 'Accepted')}
                      style={{ flex: 1, padding: '0 0.5rem', height: '40px', fontSize: '0.85rem' }}
                    >
                      <CheckCircle size={16} /> Accept
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => onUpdateStatus(order._id, 'Declined')}
                      style={{ flex: 1, padding: '0 0.5rem', height: '40px', fontSize: '0.85rem' }}
                    >
                      <XCircle size={16} /> Decline
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => navigate(`/orders/${order._id}`)}
                    style={{ flex: 1, height: '40px', fontSize: '0.85rem' }}
                  >
                    <Eye size={16} /> Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '12px', color: '#64748b' }}>
              No orders found in MongoDB.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderTable;
