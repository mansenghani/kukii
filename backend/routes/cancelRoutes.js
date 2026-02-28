const express = require('express');
const router = express.Router();
const { findBooking, sendCancellationOTP, verifyAndCancel } = require('../controllers/cancelController');

router.post('/find-booking', findBooking);
router.post('/send-otp', sendCancellationOTP);
router.post('/verify-otp', verifyAndCancel);

module.exports = router;
