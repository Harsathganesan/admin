import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Mail, Phone, Calendar, Tag, CreditCard, Maximize, Download } from 'lucide-react';

const OrderDetails = ({ orders, onUpdateStatus }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const order = orders.find(o => o._id === id);

  if (!order) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Order not found</h2>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/orders')}>
          Back to Orders
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="badge badge-pending">Pending</span>;
      case 'Accepted': return <span className="badge badge-accepted">Accepted</span>;
      case 'Declined': return <span className="badge badge-declined">Declined</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handleDownloadImage = () => {
    const imageUrl = order.referenceImage;
    if (!imageUrl) return;
    
    // Suggest a filename
    const filename = `${order.customerName}_reference.jpg`.replace(/\s+/g, '_');
    
    try {
      const backendUrl = `http://${window.location.hostname}:5005`;
      const downloadUrl = `${backendUrl}/api/download-image?fullUrl=${encodeURIComponent(imageUrl)}&downloadName=${encodeURIComponent(filename)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div>
      {/* Header section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          className="btn btn-outline" 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.25rem', wordBreak: 'break-all' }}>
            Order: {order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}
          </h1>
          {(order.status === 'Pending' || !order.status) && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-success" 
                onClick={() => onUpdateStatus(order._id, 'Accepted')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <CheckCircle size={16} /> Accept
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => onUpdateStatus(order._id, 'Declined')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <XCircle size={16} /> Decline
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="order-details-grid">
        {/* Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Personal Information</h3>
          
          <div className="detail-row">
            <div className="detail-label">Full Name</div>
            <div style={{ fontWeight: 500 }}>{order.customerName}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Email</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all', flexWrap: 'wrap' }}>
              <Mail size={16} color="#94a3b8" /> {order.customerEmail}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Phone</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={16} color="#94a3b8" /> {order.customerPhone}
            </div>
          </div>

          <h3 style={{ margin: '2rem 0 1.5rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Order Details</h3>
          
          <div className="detail-row">
            <div className="detail-label">Drawing Type</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={16} color="#818cf8" /> {order.drawingType}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Size</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Maximize size={16} color="#94a3b8" /> {order.size}
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Price</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <CreditCard size={16} color="#10b981" /> ₹{order.price}
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">Status</div>
            <div>{getStatusBadge(order.status || 'Pending')}</div>
          </div>
          
          <div className="detail-row" style={{ borderBottom: 'none' }}>
            <div className="detail-label">Order Date</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color="#94a3b8" /> {new Date(order.orderDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Reference Photo Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Reference Photo</h3>
          <div style={{ 
            border: '2px dashed #e2e8f0', 
            borderRadius: 'var(--radius)', 
            padding: '10px', 
            textAlign: 'center' 
          }}>
            {order.referenceImage ? (
              <img 
                src={order.referenceImage} 
                alt="Reference" 
                className="reference-img" 
                style={{ maxWidth: '100%', borderRadius: '8px' }} 
              />
            ) : (
              <div style={{ padding: '2rem', color: '#94a3b8' }}>No reference photo uploaded</div>
            )}
          </div>

          {/* Download Button */}
          {order.referenceImage && (
            <button 
              className="btn btn-primary" 
              onClick={handleDownloadImage}
              style={{ 
                width: '100%', 
                marginTop: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem'
              }}
            >
              <Download size={18} /> Download Photo
            </button>
          )}

          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
            Reference photo for {order.customerName}'s order
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
