const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Table = require('./models/Table');

const uri = 'mongodb://mansenghani6_db_user:gzpvaOFjPZoMFvvs@ac-tsxj5ve-shard-00-00.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-01.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-02.zcawqhy.mongodb.net:27017/kuki?ssl=true&replicaSet=atlas-9lp5j7-shard-0&authSource=admin&retryWrites=true&w=majority';

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB for seeding...');

        const customer = await Customer.findOne();
        const table = await Table.findOne();

        if (!customer || !table) {
            console.log('Please ensure you have at least one customer and one table in the DB first.');
            process.exit(1);
        }

        const today = new Date();
        const bookingsData = [
            { customerId: customer._id, tableId: table._id, date: today, time: '19:00', guests: 2, status: 'Completed', totalAmount: 1800 },
            { customerId: customer._id, tableId: table._id, date: today, time: '20:30', guests: 4, status: 'Completed', totalAmount: 4500 },
            { customerId: customer._id, tableId: table._id, date: new Date(new Date().setDate(today.getDate() - 1)), time: '18:00', guests: 2, status: 'Completed', totalAmount: 1500 },
            { customerId: customer._id, tableId: table._id, date: new Date(new Date().setMonth(today.getMonth() - 1)), time: '19:00', guests: 3, status: 'Completed', totalAmount: 3200 }
        ];

        console.log('Seeding bookings...');
        const createdBookings = await Booking.insertMany(bookingsData);

        console.log('Seeding orders...');
        for (const b of createdBookings) {
            await Order.create({
                bookingId: b._id,
                items: [{ name: 'Test Dish', quantity: 1, price: b.totalAmount }],
                totalAmount: b.totalAmount
            });
        }

        console.log('Done seeding!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
