const mongoose = require('mongoose');
const Booking = require('./models/Booking');

const uri = 'mongodb://mansenghani6_db_user:gzpvaOFjPZoMFvvs@ac-tsxj5ve-shard-00-00.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-01.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-02.zcawqhy.mongodb.net:27017/kuki?ssl=true&replicaSet=atlas-9lp5j7-shard-0&authSource=admin&retryWrites=true&w=majority';

async function checkData() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const bookingCount = await Booking.countDocuments();
        console.log('Total Bookings in DB:', bookingCount);

        const sample = await Booking.findOne();
        if (sample) {
            console.log('Sample Booking:', {
                date: sample.date,
                status: sample.status,
                totalAmount: sample.totalAmount
            });
        } else {
            console.log('No bookings found at all.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
