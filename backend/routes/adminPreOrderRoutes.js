const express = require('express');
const router = express.Router();
const preOrderController = require('../controllers/preOrderController');

// All routes here are prefixed with /api/admin/preorders
router.get('/all', preOrderController.getAdminPreOrders);
router.put('/:id/status', preOrderController.updatePreOrderStatus);
router.get('/stats', preOrderController.getPreOrderStats);

module.exports = router;
