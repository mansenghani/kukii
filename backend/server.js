const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Use Google DNS servers to resolve MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes - Explicit Registration
console.log('--- Registering API Routes ---');

// Public Data Routes
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/featured-menu', require('./routes/featuredMenuRoutes'));
app.get('/api/slots', require('./controllers/timeSlotController').getSlots);

// Business Logic Routes
app.use('/api/customers', require('./routes/customerRoutes'));
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const { protect } = require('./middleware/auth');

// Public Routes
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/preorders', require('./routes/preOrderRoutes'));
app.use('/api/cancel', require('./routes/cancelRoutes')); // Added cancelRoutes

// Admin Auth (Public Login)
app.use('/api/admin', require('./routes/adminRoutes'));

// Protected Admin Routes
app.use('/api/admin/feedback', protect, require('./routes/adminFeedbackRoutes'));
app.use('/api/admin/reports', protect, require('./routes/adminReportRoutes'));
app.use('/api/admin/footer', require('./routes/adminFooterRoutes'));
app.use('/api/admin/events', protect, require('./routes/adminEventRoutes'));
app.use('/api/admin/preorders', protect, require('./routes/adminPreOrderRoutes'));
app.use('/api/admin/slots', protect, require('./routes/adminTimeSlotRoutes'));
app.use('/api/admin/sidebar', require('./routes/adminSidebarRoutes')); // Using internal protect
app.use('/api/admin/cancel', protect, require('./routes/adminCancelRoutes'));
app.use('/api/dashboard', protect, require('./routes/dashboardRoutes'));
app.use('/api/settings', protect, require('./routes/settingsRoutes'));

// Serve Uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


console.log('✅ All API routes initialized');
console.log('------------------------------');

app.get('/', (req, res) => {
  res.send('Kuki API is running correctly...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// TEST Route to verify connectivity
app.get('/api/test-connection', (req, res) => {
  res.json({ message: "Backend is reachable on port 5050" });
});

// API 404 Handler - MUST BE LAST in /api stack
app.use('/api', (req, res) => {
  console.log(`❌ 404 API Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `The API endpoint '${req.originalUrl}' does not exist on this server.`,
    availableEndpoints: [
      "/api/categories", "/api/menu", "/api/tables", "/api/feedback", "/api/events", "/api/preorders", "/api/admin/preorders"
    ]

  });
});

// Database Connection
const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kuki';

const { seedSidebarItems } = require('./controllers/sidebarController');

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');

    // Auto-Seed Admin Sidebar 
    await seedSidebarItems();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`API BASE: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });
