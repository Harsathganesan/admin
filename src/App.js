import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import OrdersManagement from './pages/OrdersManagement';
import OrderDetails from './pages/OrderDetails';
import Feedbacks from './pages/Feedbacks';
import Login from './pages/Login';
import Settings from './pages/Settings';
import './styles/index.css';

// Use relative /api for production on Vercel, or proxy in dev
const API_BASE = process.env.REACT_APP_API_URL || '';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('token')
  );
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(
    localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('token')
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
  };

  // Fetch initial orders and feedbacks from MongoDB
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [ordersRes, fbRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/feedbacks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (ordersRes.status === 401 || ordersRes.status === 403 || fbRes.status === 401 || fbRes.status === 403) {
        handleLogout();
        return;
      }

      const ordersData = await ordersRes.json();
      const fbData = await fbRes.json();

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setFeedbacks(Array.isArray(fbData) ? fbData : []);
      setLoading(false);
    } catch (error) {
      console.error('Network Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();

      // Implement Polling since Sockets are not supported on Vercel Serverless
      const pollInterval = setInterval(() => {
        fetchData();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated]);

  const sendWhatsAppMessage = (order, status) => {
    // Get phone number from order
    let phone = order.customerPhone || '';
    // Remove spaces, dashes, brackets, and + sign
    phone = phone.replace(/[\s\-()+]/g, '');
    // If number doesn't start with country code, add India (+91)
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    let message = '';
    if (status === 'Accepted') {
      message = `✅ வணக்கம் ${order.customerName}! உங்கள் Drawing Order Accept ஆகிவிட்டது! 🎨\n\nOrder ID: ${order.orderNumber || order._id.slice(-8).toUpperCase()}\nDrawing Type: ${order.drawingType}\nSize: ${order.size}\nPrice: ₹${order.price}\n\nநாங்கள் விரைவில் உங்களை தொடர்பு கொள்கிறோம். நன்றி! 🙏`;
    } else if (status === 'Declined') {
      message = `❌ வணக்கம் ${order.customerName}, மன்னிக்கவும்!\n\nதற்போது உங்கள் Drawing Order-ஐ Decline செய்திருக்கிறோம்.\n\nOrder ID: ${order.orderNumber || order._id.slice(-8).toUpperCase()}\n\nஏதேனும் ஐயங்கள் இருந்தால் தொடர்பு கொள்ளுங்கள். நன்றி!`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (response.ok) {
        const updatedOrder = await response.json();
        // ...
        sendWhatsAppMessage(updatedOrder, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={(auth) => { 
      setIsAuthenticated(auth);
      setLoading(true); // Ensure loading is true when logging in to fetch data
    }} />;
  }

  if (loading && isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(99, 102, 241, 0.1)', 
            borderTop: '4px solid #6366f1', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
          <h2 style={{ color: '#6366f1', marginBottom: '8px' }}>Loading Dashboard...</h2>
          <p style={{ color: '#94a3b8' }}>Connecting to MongoDB Atlas Live</p>
        </div>
      </div>
    );
  }


  return (
    <Router>
      <div className="app-container">
        <Sidebar onLogout={handleLogout} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="main-content">
          <Navbar onLogout={handleLogout} toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <div className="page-content">
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard orders={orders} feedbacks={feedbacks} onUpdateStatus={handleUpdateStatus} />} 
              />
              <Route 
                path="/orders" 
                element={<OrdersManagement orders={orders} onUpdateStatus={handleUpdateStatus} />} 
              />
              <Route 
                path="/orders/:id" 
                element={<OrderDetails orders={orders} onUpdateStatus={handleUpdateStatus} />} 
              />
              <Route 
                path="/feedbacks" 
                element={<Feedbacks feedbacks={feedbacks} />} 
              />

              <Route 
                path="/settings" 
                element={<Settings />} 
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

