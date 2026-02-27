const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true,
    },
    maxTables: {
        type: Number,
        required: true,
        default: 30,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isPeak: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
