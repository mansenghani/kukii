const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
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
  totalAmount: {
    type: Number,
    default: 0,
  },
  preOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PreOrder',
  },
  preorderStatus: {
    type: String,
    enum: ['pending', 'completed', 'skipped'],
    default: 'pending'
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
