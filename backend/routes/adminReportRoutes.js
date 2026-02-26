const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/daily', reportController.getDailyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/top-food', reportController.getTopFood);
router.get('/peak-hours', reportController.getPeakHours);
router.get('/visit-frequency', reportController.getVisitFrequency);
router.get('/transactions', reportController.getTransactions);

// Export routes
router.get('/export/pdf', reportController.exportPDF);
router.get('/export/excel', reportController.exportExcel);

module.exports = router;
