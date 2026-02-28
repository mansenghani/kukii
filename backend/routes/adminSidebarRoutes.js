const express = require('express');
const router = express.Router();
const sidebarController = require('../controllers/sidebarController');
const { protect } = require('../middleware/auth');

// Get all sidebar items (Can be public or protected, but likely only visible inside admin)
router.get('/', protect, sidebarController.getSidebarItems);

// Toggle visibility of a sidebar item (Admin Only)
router.patch('/:id/toggle', protect, sidebarController.toggleSidebarItem);

module.exports = router;
