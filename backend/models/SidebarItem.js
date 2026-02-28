const mongoose = require('mongoose');

const sidebarItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    route: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SidebarItem', sidebarItemSchema);
