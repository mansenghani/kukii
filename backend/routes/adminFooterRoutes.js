const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');

router.get('/', footerController.getFooterSettings);
router.put('/', footerController.updateFooterSettings);

module.exports = router;
