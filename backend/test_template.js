
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { sendUserBookingEmail } = require('./utils/sendEmail');

dotenv.config();

const testTemplate = async () => {
    const time = new Date().getTime();
    console.log(`--- Testing Booking Email Template (${time}) ---`);

    // Dummy populated booking object
    const dummyBooking = {
        _id: new mongoose.Types.ObjectId(),
        date: new Date(),
        time: '19:30',
        guests: 4,
        type: 'Window Table',
        customerId: {
            name: 'Luxury Tester',
            email: 'noreply.ecart27@gmail.com',
            phone: '+1 234 567 890'
        },
        preOrderId: {
            items: [
                { name: 'Truffle Pasta', quantity: 2, price: 1200, total: 2400 },
                { name: 'Red Wine', quantity: 1, price: 3500, total: 3500 }
            ],
            grandTotal: 5900
        }
    };

    // We can't easily change the subject inside bookingEmail.js without editing it,
    // but the mail.log will show the timestamp.

    try {
        await sendUserBookingEmail(dummyBooking, 'Confirmed');
        console.log(`✅ Test email process triggered at ${new Date().toISOString()}`);
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

testTemplate();
