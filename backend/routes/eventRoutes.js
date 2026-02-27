const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Log when this route file is loaded
console.log('📦 Event Routes Loaded');

// POST /api/events/
router.post('/', eventController.createEvent);

// GET /api/events/availability
router.get('/availability', eventController.checkAvailability);

module.exports = router;
