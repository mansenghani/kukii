const express = require('express');
const router = express.Namespace ? express.Namespace() : express.Router();
const adminCancelController = require('../controllers/adminCancelController');

router.post('/send-otp', adminCancelController.sendOTP);
router.post('/verify-otp', adminCancelController.verifyOTP);
router.post('/resend-otp', adminCancelController.resendOTP);

module.exports = router;
