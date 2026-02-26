const express = require('express');
const router = express.Router();
const preOrderController = require('../controllers/preOrderController');

router.post('/', preOrderController.createPreOrder);
router.get('/', preOrderController.getPreOrders);
router.put('/:id', preOrderController.updatePreOrder);

module.exports = router;
