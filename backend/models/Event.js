const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        enum: ['10:00 AM - 02:00 PM', '06:00 PM - 10:00 PM'],
        required: true,
    },
    guests: {
        type: Number,
        required: true,
        min: 1,
    },
    specialRequest: {
        type: String,
        default: '',
    },
    uniqueBookingId: {
        type: String,
        unique: true,
    },
    otp: String,
    otpExpiry: Date,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
    },
    preOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PreOrder',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Event', eventSchema);
