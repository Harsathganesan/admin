import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client'; // Add socket.io-client
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import OrdersManagement from './pages/OrdersManagement';
import OrderDetails from './pages/OrderDetails';
import Feedbacks from './pages/Feedbacks';
import Login from './pages/Login';
import Settings from './pages/Settings';
import './styles/index.css';

// Initialize Socket.io (Dynamic URL for mobile access)
// Initialize Socket.io (Dynamic URL for local and production)
// Initialize Socket.io (Dynamic URL for local and production)
// Initialize Socket.io (Point to port 5005 if in development, otherwise same origin)
const SOCKET_URL = window.location.port && window.location.port !== '5005'
  ? `${window.location.protocol}//${window.location.hostname}:5005`
  : window.location.origin;

const socket = io(SOCKET_URL, {
  path: '/socket.io/',
  transports: ['polling', 'websocket'] // Vercel prefers polling initially
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch initial orders and feedbacks from MongoDB
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching initial data...');
      
      const [ordersRes, fbRes] = await Promise.all([
        fetch(`${SOCKET_URL}/api/orders`),
        fetch(`${SOCKET_URL}/api/feedbacks`)
      ]);

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
    fetchData();

    // SETUP SOCKET LISTENERS for real-time updates
    socket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    socket.on('ordersUpdated', (updatedOrders) => {
      console.log('REAL-TIME UPDATE: Orders updated!', updatedOrders);
      setOrders(updatedOrders);
    });

    socket.on('feedbacksUpdated', (updatedFeedbacks) => {
      console.log('REAL-TIME UPDATE: Feedbacks updated!', updatedFeedbacks);
      setFeedbacks(updatedFeedbacks);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });

    // Cleanup on unmount
    return () => {
      socket.off('ordersUpdated');
      socket.off('feedbacksUpdated');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

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
      const response = await fetch(`${SOCKET_URL}/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        // Local state will be updated automatically via socket emit from backend
        // but we can also update it manually for immediate feedback if needed
        // For now, Change Stream will handle it.
        
        // Send WhatsApp message to customer
        sendWhatsAppMessage(updatedOrder, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#6366f1' }}>Loading...</h2>
          <p>Connecting to MongoDB Atlas Live</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

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

