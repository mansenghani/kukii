const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// USER ROUTES
// POST /api/feedback (Submit feedback)
router.post('/', feedbackController.submitFeedback);

// GET /api/feedback/approved (Get only approved feedback for public display)
router.get('/approved', feedbackController.getApprovedFeedback);

// Keep this for legacy dashboard compatibility
router.get('/', feedbackController.getAllFeedback);
router.put('/:id', feedbackController.updateFeedbackStatus);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
