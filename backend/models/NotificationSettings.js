const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
    emailNotifications: { type: Boolean, default: true },
    reservationAlert: { type: Boolean, default: true },
    reviewNotification: { type: Boolean, default: true },
    dailyReportAlert: { type: Boolean, default: true }
});

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
