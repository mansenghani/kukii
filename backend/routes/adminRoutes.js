const express = require('express');
const router = express.Router();
const { loginAdmin, updateAdminProfile, changePassword, logoutAllSessions } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.post('/login', loginAdmin);
router.put('/profile', protect, updateAdminProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout-all', protect, logoutAllSessions);

module.exports = router;
