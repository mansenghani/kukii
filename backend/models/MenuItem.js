const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        default: ''
    },
    availability: {
        type: Boolean,
        default: true
    },
    isAvailable: { // Adding as requested by user
        type: Boolean,
        default: true
    },
    totalOrdered: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
