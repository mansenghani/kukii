const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlotController');

router.get('/', timeSlotController.getSlots);
router.post('/', timeSlotController.addSlot);
router.patch('/bulk-update', timeSlotController.bulkUpdate); // Must be before /:id routes
router.put('/:id', timeSlotController.updateMaxTables);
router.patch('/:id/toggle', timeSlotController.toggleActive);
router.patch('/:id/peak', timeSlotController.togglePeak);
router.delete('/:id', timeSlotController.deleteSlot);

module.exports = router;
