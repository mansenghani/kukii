const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAdminEvents);
router.post('/', eventController.createAdminEvent);
router.get('/:id', eventController.getEventById);
router.put('/:id/status', eventController.updateEventStatus);

module.exports = router;
