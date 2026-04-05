const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

// Simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ensure uploads directory exists (Only if NOT on Vercel)
const fs = require('fs');
if (!process.env.VERCEL) {
    const uploadDir = path.join(__dirname, 'uploads');
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
    } catch (err) {
        console.warn('⚠️ Could not create uploads directory:', err.message);
    }
}

// Schemas & Models
const orderSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  drawingType: String,
  size: String,
  price: Number,
  description: String,
  referenceImage: String,
  specialInstructions: String,
  paymentMethod: String,
  deliveryDate: String,
  orderNumber: String,
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
  orderDate: { type: String, default: () => new Date().toISOString() }
}, { collection: 'orders', timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'fb', timestamps: true });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// MongoDB Config Options
const mongooseOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000
};

// MongoDB Connection Helper (Non-blocking)
const ensureDb = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is missing - Database-dependent features will fail');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

// Initiate connection in background, but don't block process
ensureDb().catch(console.error);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// DB Stats & Ping Route
app.get(['/api/ping', '/ping'], (req, res) => {
  res.json({ 
    status: 'ok', 
    vercel: !!process.env.VERCEL,
    db_state: mongoose.connection.readyState 
  });
});

// Routes - Array matching for Vercel/Local compatibility
app.post(['/api/login', '/login'], (req, res) => {
    const { username, password } = req.body;
    if (username === 'harsatharts9' && password === 'admin123') {
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get(['/api/orders', '/orders'], authenticateToken, async (req, res) => {
    try { 
        await ensureDb(); 
        res.json(await Order.find().sort({ orderDate: -1 })); 
    }
    catch (err) { 
        console.error('❌ GET Orders Error:', err);
        res.status(500).json({ message: err.message }); 
    }
});

app.get(['/api/feedbacks', '/feedbacks'], authenticateToken, async (req, res) => {
    try { 
        await ensureDb(); 
        res.json(await Feedback.find().sort({ createdAt: -1 })); 
    }
    catch (err) { 
        console.error('❌ GET Feedbacks Error:', err);
        res.status(500).json({ message: err.message }); 
    }
});

// Logging middleware was moved to top


app.patch(['/api/orders/:id', '/orders/:id'], authenticateToken, async (req, res) => {
    try { 
        await ensureDb(); 
        res.json(await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })); 
    }
    catch (err) { res.status(400).json({ message: err.message }); }
});

app.get(['/api/download-image', '/download-image'], async (req, res) => {
    try {
        const fullUrl = req.query.fullUrl;
        const downloadName = req.query.downloadName || 'download.jpg';

        if (fullUrl) {
            const response = await fetch(fullUrl);
            // Original check: if (!response.ok) return res.status(404).send('Remote file not found');
            // The provided "Code Edit" snippet for this section was syntactically incorrect and
            // contained frontend-specific logic (setError, response.json for image).
            // Reverting to the original correct backend logic for image download.
            if (!response.ok) {
                return res.status(404).send('Remote file not found');
            }
            const blob = await response.blob();
            const buffer = Buffer.from(await blob.arrayBuffer());
            res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
            res.setHeader('Content-Type', 'image/jpeg');
            return res.send(buffer);
        }
        res.status(400).send('Url missing');
    } catch (err) {
        res.status(500).send('Download error');
    }
});

// Serve frontend static files
const buildPath = path.join(__dirname, '../build');
if (!process.env.VERCEL) {
  app.use(express.static(buildPath));
}

// Catch-all route
app.get('/{*path}', (req, res) => {
    // Return 404 JSON for any unmatched API calls
    if (req.path.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    
    // Server static frontend only if not on Vercel
    if (!process.env.VERCEL) {
        res.sendFile(path.join(buildPath, 'index.html'));
    } else {
        res.status(404).json({ message: 'Page not found on Vercel handler' });
    }
});

// Start server locally
if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
