const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const { sendBookingEmail } = require('./utils/bookingEmail');

async function testRealUtility() {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);

    // Create a mock booking object that matches what the utility expects
    const mockBooking = {
        date: new Date(),
        time: '20:00',
        guests: 4,
        type: 'table',
        customerId: {
            name: 'Test User',
            email: process.env.EMAIL_USER // Send to self for testing
        },
        preOrderId: {
            items: [
                { name: 'Mock Pizza', quantity: 2, price: 500 },
                { name: 'Mock Soda', quantity: 1, price: 100 }
            ],
            grandTotal: 1100
        }
    };

    console.log('Calling sendBookingEmail...');
    try {
        await sendBookingEmail(mockBooking, 'Confirmed');
        console.log('Utility function finished execution.');
    } catch (err) {
        console.error('Utility failed:', err);
    }

    process.exit();
}

testRealUtility();
