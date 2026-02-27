const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getRestaurantSettings, updateRestaurantSettings,
    getBookingSettings, updateBookingSettings,
    getNotificationSettings, updateNotificationSettings,
    getSystemPreferences, updateSystemPreferences,
    resetSettings, deleteAllData
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

router.get('/restaurant', protect, getRestaurantSettings);
router.put('/restaurant', protect, upload.single('logo'), updateRestaurantSettings);

router.get('/booking', protect, getBookingSettings);
router.put('/booking', protect, updateBookingSettings);

router.get('/notification', protect, getNotificationSettings);
router.put('/notification', protect, updateNotificationSettings);

router.get('/preferences', protect, getSystemPreferences);
router.put('/preferences', protect, updateSystemPreferences);

router.post('/reset', protect, resetSettings);
router.delete('/reports', protect, deleteAllData);

module.exports = router;
