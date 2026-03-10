const express = require('express');
const router = express.Router();
const { getPendingNotifications, updateNotificationStatus } = require('../controllers/adminNotificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPendingNotifications);
router.put('/status', protect, updateNotificationStatus);

module.exports = router;
