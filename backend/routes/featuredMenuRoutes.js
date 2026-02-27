const express = require('express');
const router = express.Router();
const { getFeaturedMenu, updateFeaturedMenu } = require('../controllers/featuredMenuController');
const { protect } = require('../middleware/auth');

// Public route to fetch featured items for the home page
router.get('/', getFeaturedMenu);

// Private route for admin to update selection
router.put('/', protect, updateFeaturedMenu);

module.exports = router;
