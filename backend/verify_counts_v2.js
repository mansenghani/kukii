const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Category = require('./models/Category');
const Booking = require('./models/Booking');
const PreOrder = require('./models/PreOrder');
const dotenv = require('dotenv');
const dns = require('dns');

// CRITICAL: Set DNS servers for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kuki';

async function verify() {
    console.log('Using URI:', uri.substring(0, 20) + '...');
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('--- Database Verification ---');

        const menuCount = await MenuItem.countDocuments();
        const catCount = await Category.countDocuments();
        const bookingCount = await Booking.countDocuments();
        const preOrderCount = await PreOrder.countDocuments();

        console.log(`Menu Items: ${menuCount}`);
        console.log(`Categories: ${catCount}`);
        console.log(`Bookings: ${bookingCount}`);
        console.log(`Pre-Orders: ${preOrderCount}`);

        process.exit(0);
    } catch (err) {
        console.error('Connection Failed:', err.message);
        process.exit(1);
    }
}

verify();
