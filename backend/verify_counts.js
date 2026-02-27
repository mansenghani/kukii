const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Category = require('./models/Category');
const Booking = require('./models/Booking');
const PreOrder = require('./models/PreOrder');
const dotenv = require('dotenv');

dotenv.config();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kuki';

async function verify() {
    try {
        await mongoose.connect(uri);
        console.log('--- Database Verification ---');

        const menuCount = await MenuItem.countDocuments();
        const catCount = await Category.countDocuments();
        const bookingCount = await Booking.countDocuments();
        const preOrderCount = await PreOrder.countDocuments();

        console.log(`Menu Items: ${menuCount}`);
        console.log(`Categories: ${catCount}`);
        console.log(`Bookings: ${bookingCount}`);
        console.log(`Pre-Orders: ${preOrderCount}`);

        if (catCount > 0) {
            const cats = await Category.find().limit(5);
            console.log('Categories:', cats.map(c => c.name));
        }

        if (menuCount > 0) {
            const menus = await MenuItem.find().limit(5);
            console.log('Menu Items:', menus.map(m => m.name));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
