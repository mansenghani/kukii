const mongoose = require('mongoose');
const PreOrder = require('./models/PreOrder');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Event = require('./models/Event');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const preOrders = await PreOrder.find()
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'customerId',
                    model: 'Customer'
                }
            })
            .lean();

        console.log(JSON.stringify(preOrders, null, 2));
        process.exit(0);
    })
    .catch(console.error);
