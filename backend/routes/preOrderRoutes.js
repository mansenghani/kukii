const express = require('express');
const router = express.Router();
const preOrderController = require('../controllers/preOrderController');

// Public User Routes
router.post('/', preOrderController.createPreOrder);
router.get('/:bookingId', preOrderController.getPreOrderByBookingId);



module.exports = router;
