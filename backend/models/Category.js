const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Pre-remove hook to delete menu items when category is deleted
categorySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const MenuItem = mongoose.model('MenuItem');
    await MenuItem.deleteMany({ categoryId: this._id });
    next();
});

module.exports = mongoose.model('Category', categorySchema);
