const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const connectDB = require('./config/db');
const initSocketServer = require('./sockets');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const erRoutes = require('./routes/erRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocketServer(server);
app.set('io', io);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Rate Limiting
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ER Connect Backend',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ers', erRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn('⚠️  MONGO_URI not configured in server/.env. Database connection skipped.');
      console.warn('⚠️  Please add your MongoDB Atlas connection string to server/.env to use database features.');
    }

    server.listen(env.PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 ER Connect Server running on port ${env.PORT}`);
      console.log(`🌐 Allowed Client URL: ${env.CLIENT_URL}`);
      console.log(`🔐 Anonymity & AES-256-GCM Encryption Active`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
