const mongoose = require('mongoose');
const PreOrder = require('./models/PreOrder');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Event = require('./models/Event');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        let preOrders = await PreOrder.find().populate('bookingId');
        preOrders = await Customer.populate(preOrders, { path: 'bookingId.customerId' });
        console.log(JSON.stringify(preOrders[0].bookingId, null, 2));
        process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
