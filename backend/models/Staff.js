const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    default: 'Manager'
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  shift: {
    type: String,
    required: true,
    enum: ['Morning', 'Evening', 'Full Day'],
    default: 'Morning'
  },
  shiftSub: {
    type: String,
    default: 'Full Time • Mon-Fri'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  avatar: {
    type: String,
    default: ''
  },
  joinDate: {
    type: String,
    default: () => `JOINED ${new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`
  },
  initials: {
    type: String,
    default: 'NS'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);
