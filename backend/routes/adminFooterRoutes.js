const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');
const { protect } = require('../middleware/auth');

router.get('/', footerController.getFooterSettings);
router.put('/', protect, footerController.updateFooterSettings);

module.exports = router;
