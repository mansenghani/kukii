const mongoose = require('mongoose');

const bookingSettingsSchema = new mongoose.Schema({
    onlineReservations: { type: Boolean, default: true },
    autoConfirmation: { type: Boolean, default: false },
    maxTables: { type: Number, default: 24 },
    bookingDuration: { type: String, default: '1.5 Hours' }
});

module.exports = mongoose.model('BookingSettings', bookingSettingsSchema);
