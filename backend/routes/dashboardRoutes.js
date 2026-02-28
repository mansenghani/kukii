const express = require('express');
const router = express.Router();
const dash = require('../controllers/dashboardController');

router.get('/summary-cards', dash.getSummaryCards);
router.get('/daily-bookings', dash.getDailyBookings);
router.get('/monthly-revenue', dash.getMonthlyRevenue);
router.get('/booking-status', dash.getBookingStatus);
router.get('/top-items', dash.getTopItems);
router.get('/peak-slots', dash.getPeakSlots);

module.exports = router;
