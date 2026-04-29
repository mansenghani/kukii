const mongoose = require('mongoose');
const Booking = require('./models/Booking');

async function checkIds() {
    try {
        await mongoose.connect('mongodb://localhost:27017/kuki', { serverSelectionTimeoutMS: 2000 });
        const bookings = await Booking.find({}).sort({createdAt: -1}).limit(5).select('uniqueBookingId');
        console.log('Recent Booking IDs in DB:');
        bookings.forEach(b => console.log(`- "${b.uniqueBookingId}"`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIds();
