const RestaurantSettings = require('../models/RestaurantSettings');
const BookingSettings = require('../models/BookingSettings');
const NotificationSettings = require('../models/NotificationSettings');
const SystemPreferences = require('../models/SystemPreferences');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const PreOrder = require('../models/PreOrder');
const Feedback = require('../models/Feedback');

// --- Helper to get or create settings ---
const getSettings = async (Model) => {
    let settings = await Model.findOne();
    if (!settings) {
        settings = new Model();
        await settings.save();
    }
    return settings;
};

// @desc    Get restaurant settings
// @route   GET /api/settings/restaurant
exports.getRestaurantSettings = async (req, res) => {
    try {
        const settings = await getSettings(RestaurantSettings);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update restaurant settings
// @route   PUT /api/settings/restaurant
exports.updateRestaurantSettings = async (req, res) => {
    try {
        const settings = await getSettings(RestaurantSettings);
        Object.assign(settings, req.body);
        if (req.file) {
            settings.logo = `/uploads/${req.file.filename}`;
        }
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get booking settings
// @route   GET /api/settings/booking
exports.getBookingSettings = async (req, res) => {
    try {
        const settings = await getSettings(BookingSettings);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking settings
// @route   PUT /api/settings/booking
exports.updateBookingSettings = async (req, res) => {
    try {
        const settings = await getSettings(BookingSettings);
        Object.assign(settings, req.body);
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get notification settings
// @route   GET /api/settings/notification
exports.getNotificationSettings = async (req, res) => {
    try {
        const settings = await getSettings(NotificationSettings);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update notification settings
// @route   PUT /api/settings/notification
exports.updateNotificationSettings = async (req, res) => {
    try {
        const settings = await getSettings(NotificationSettings);
        Object.assign(settings, req.body);
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get system preferences
// @route   GET /api/settings/preferences
exports.getSystemPreferences = async (req, res) => {
    try {
        const settings = await getSettings(SystemPreferences);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system preferences
// @route   PUT /api/settings/preferences
exports.updateSystemPreferences = async (req, res) => {
    try {
        const settings = await getSettings(SystemPreferences);
        Object.assign(settings, req.body);
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reset all settings to default
// @route   POST /api/system/reset
exports.resetSettings = async (req, res) => {
    try {
        await Promise.all([
            RestaurantSettings.deleteMany({}),
            BookingSettings.deleteMany({}),
            NotificationSettings.deleteMany({}),
            SystemPreferences.deleteMany({})
        ]);
        res.json({ message: 'All system settings have been reset to factory defaults' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all reports/data
// @route   DELETE /api/reports
exports.deleteAllData = async (req, res) => {
    try {
        // According to user request: "Purge all historical analytics and report data"
        // This implies orders, bookings, preorders, etc.
        await Promise.all([
            Booking.deleteMany({}),
            Order.deleteMany({}),
            PreOrder.deleteMany({}),
            Feedback.deleteMany({})
        ]);
        res.json({ message: 'All historical data and reports have been purged' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
