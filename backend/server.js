const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Use Google DNS servers to resolve MongoDB SRV records when local DNS fails
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
console.log('--- Registering API Routes ---');
try {
  // We register categories FIRST to ensure they are available even if other routes have errors
  app.use('/api/categories', require('./routes/categoryRoutes'));
  console.log('✅ Route Registered: /api/categories');

  app.use('/api/feedback', require('./routes/feedbackRoutes'));
  console.log('✅ Route Registered: /api/feedback');

  app.use('/api/admin/feedback', require('./routes/adminFeedbackRoutes'));
  app.use('/api/admin/reports', require('./routes/adminReportRoutes'));
  app.use('/api/admin/footer', require('./routes/adminFooterRoutes'));
  console.log('✅ Route Registered: /api/admin/footer');

  app.use('/api/customers', require('./routes/customerRoutes'));
  console.log('✅ Route Registered: /api/customers');

  app.use('/api/tables', require('./routes/tableRoutes'));
  console.log('✅ Route Registered: /api/tables');

  app.use('/api/bookings', require('./routes/bookingRoutes'));
  console.log('✅ Route Registered: /api/bookings');

  app.use('/api/menu', require('./routes/menuRoutes'));
  console.log('✅ Route Registered: /api/menu');

  app.use('/api/preorders', require('./routes/preOrderRoutes'));
  console.log('✅ Route Registered: /api/preorders');
} catch (err) {
  console.error('❌ Error loading routes:', err.message);
}
console.log('------------------------------');

app.get('/', (req, res) => {
  res.send('Kuki API is running...');
});

// Database Connection
const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kuki';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
