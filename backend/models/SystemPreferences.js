const mongoose = require('mongoose');

const systemPreferencesSchema = new mongoose.Schema({
    currency: { type: String, default: 'INR' },
    timeFormat: { type: String, default: '12-hour (1:00 PM)' }
});

module.exports = mongoose.model('SystemPreferences', systemPreferencesSchema);
