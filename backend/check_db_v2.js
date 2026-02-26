const mongoose = require('mongoose');

const uri = 'mongodb://mansenghani6_db_user:gzpvaOFjPZoMFvvs@ac-tsxj5ve-shard-00-00.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-01.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-02.zcawqhy.mongodb.net:27017/kuki?ssl=true&replicaSet=atlas-9lp5j7-shard-0&authSource=admin&retryWrites=true&w=majority';

async function check() {
    console.log('Starting DB check...');
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');

        const Booking = mongoose.model('Booking', new mongoose.Schema({
            date: Date,
            status: String,
            totalAmount: Number
        }), 'bookings');

        const total = await Booking.countDocuments();
        console.log('Total bookings:', total);

        const completed = await Booking.countDocuments({ status: 'Completed' });
        console.log('Completed bookings:', completed);

        const latest = await Booking.findOne().sort({ _id: -1 });
        console.log('Latest booking:', latest);

        process.exit(0);
    } catch (err) {
        console.error('Error during check:', err);
        process.exit(1);
    }
}

check();
