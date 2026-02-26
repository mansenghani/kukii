const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    // We use 'message' as the standard field. 
    // The controller fallback ensures 'review' data from old forms is saved here.
    message: {
        type: String,
        required: [true, 'Please provide your experience message']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    visitDate: { type: Date },
    tableNo: { type: String },
    serviceStaff: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
