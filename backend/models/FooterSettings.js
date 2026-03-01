const mongoose = require('mongoose');

const footerSettingsSchema = new mongoose.Schema({
    restaurantName: { type: String, default: 'KUKI' },
    tagline: { type: String, default: 'Providing a 5-star gastronomic experience with the finest ingredients and world-class service since 1924.' },
    weekdayHours: { type: String, default: '18:00 - 23:00' },
    saturdayHours: { type: String, default: '17:00 - 00:00' },
    sundayHours: { type: String, default: '17:00 - 22:00' },
    phone: { type: String, default: '+1 (234) 567-8910' },
    alternatePhone: { type: String, default: '' },
    email: { type: String, default: 'reservations@kukidining.com' },
    address: { type: String, default: '123 Luxury Ave, Manhattan, NY' },
    mapLink: { type: String, default: '' },
    facebook: { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    whatsapp: { type: String, default: '#' },
    newsletterText: { type: String, default: 'Join our club for exclusive events and seasonal updates.' },
    copyrightText: { type: String, default: 'KUKI DINING. ALL RIGHTS RESERVED.' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FooterSettings', footerSettingsSchema);
