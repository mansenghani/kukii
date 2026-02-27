const mongoose = require('mongoose');

const featuredMenuSchema = new mongoose.Schema({
    menuIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one document exists
featuredMenuSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('FeaturedMenu', featuredMenuSchema);
