const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// GET /api/admin/feedback   (Get all feedback including pending)
router.get('/', feedbackController.getAllFeedback);

// GET /api/admin/feedback/:id  (Get full single review)
router.get('/:id', feedbackController.getFeedbackById);

// PUT /api/admin/feedback/:id/approve  (Mark as approved)
router.put('/:id/approve', feedbackController.approveFeedback);

// PUT /api/admin/feedback/:id/reject   (Mark as rejected)
router.put('/:id/reject', feedbackController.rejectFeedback);

module.exports = router;
