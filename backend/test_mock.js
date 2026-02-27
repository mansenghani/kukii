const mongoose = require('mongoose');
const PreOrder = require('./models/PreOrder');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Event = require('./models/Event');
const dotenv = require('dotenv');

dotenv.config();

// Bypass network error by mocking
const run = async () => {
    // Mock the Mongoose logic locally
    let preOrders = [
        {
            _id: 'p1',
            type: 'table',
            bookingId: {
                _id: 'b1',
                customerId: 'c1',
                date: '2026-02-27'
            }
        },
        {
            _id: 'p2',
            type: 'event',
            bookingId: {
                _id: 'e1',
                name: 'Event Guy',
                eventDate: '2026-02-28'
            }
        }
    ];

    // Wait, Mongoose populate requires preOrders to be Mongoose Documents.
    // If we just use Model.populate on lean objects, it might work or fail. Let's trace mongoose doc
};
run();
