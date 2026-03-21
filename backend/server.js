const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
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

const Order = mongoose.model('Order', orderSchema);

const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'fb', timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

// MongoDB Config Options
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Increased timeout for better stability
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4
};

// MongoDB Connection with Retry Logic
const connectDB = async (retryCount = 0) => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5000; // 5 seconds

  try {
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('✅ Connected to MongoDB Atlas: Drawing');
    
    // Set up change streams once connected
    setupChangeStreams();
  } catch (err) {
    console.error(`❌ MongoDB Connection Error (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, err.message);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY/1000}s...`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY);
    } else {
      console.error('CRITICAL: Max retries reached. Please check your IP Whitelist in MongoDB Atlas.');
    }
  }
};

const setupChangeStreams = () => {
  // Watch orders
  const orderChangeStream = Order.watch();
  orderChangeStream.on('change', (change) => {
    console.log('Real-time Order Update:', change.operationType);
    Order.find().sort({ createdAt: -1 })
      .then(orders => io.emit('ordersUpdated', orders))
      .catch(err => console.error('Broadcast Error:', err));
  });
  orderChangeStream.on('error', (err) => {
    console.error('Order Stream Error:', err.message);
    // Attempt stream recovery if it closes
    if (err.codeName === 'ChangeStreamHistoryLost') {
      setTimeout(setupChangeStreams, 5000);
    }
  });

  // Watch feedbacks
  const fbChangeStream = Feedback.watch();
  fbChangeStream.on('change', (change) => {
    console.log('Real-time Feedback Update:', change.operationType);
    Feedback.find().sort({ createdAt: -1 })
      .then(fbs => io.emit('feedbacksUpdated', fbs))
      .catch(err => console.error('Broadcast Error:', err));
  });
  fbChangeStream.on('error', (err) => console.error('Feedback Stream Error:', err.message));
};

// Start connection
connectDB();

// Connection Event Listeners
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected. Reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Reconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB Connection Event Error:', err);
});

// Socket.io
io.on('connection', (socket) => console.log('Client connected:', socket.id));

// Serve frontend static files
const buildPath = path.join(__dirname, '../build');
app.use(express.static(buildPath));

// API Routes
app.get('/api/orders', async (req, res) => {
  try { res.json(await Order.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/feedbacks', async (req, res) => {
  try { res.json(await Feedback.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/api/orders/:id', async (req, res) => {
  try { res.json(await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

app.get('/api/download-image', async (req, res) => {
  try {
    const filename = req.query.file;
    const fullUrl = req.query.fullUrl;
    const downloadName = req.query.downloadName || filename || 'download.jpg';

    if (fullUrl) {
      // Proxy remotely hosted image
      const response = await fetch(fullUrl);
      if (!response.ok) return res.status(404).send('Remote file not found');
      
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      res.setHeader('Content-Type', 'image/jpeg');
      return res.send(buffer);
    }

    if (!filename) return res.status(400).send('Filename missing');
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check local filesystem
    if (fs.existsSync(filePath)) {
      return res.download(filePath, downloadName);
    } else {
      return res.status(404).send('File missing in local uploads. Please check the URL.');
    }
  } catch (err) {
    console.error('Download API Error:', err);
    res.status(500).send('Download error');
  }
});

// Catch-all route for React (SPA)
app.get('*all', (req, res) => {
  // If request is for an API that doesn't exist, don't return index.html
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API Route Not Found' });
  }
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start server only if not running in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Export for Vercel
module.exports = app;
