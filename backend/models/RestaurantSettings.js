const mongoose = require('mongoose');

const restaurantSettingsSchema = new mongoose.Schema({
    logo: { type: String, default: '' },
    name: { type: String, default: 'LUXE Fine Dining' },
    email: { type: String, default: 'contact@luxedining.com' },
    phone: { type: String, default: '+91 98765 43210' },
    website: { type: String, default: 'https://luxedining.com' },
    address: { type: String, default: '123 Luxury Lane, Rose Garden Estate, Delhi - 110001' }
});

module.exports = mongoose.model('RestaurantSettings', restaurantSettingsSchema);
