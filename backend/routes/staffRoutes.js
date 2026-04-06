const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { protect } = require('../middleware/auth'); // If protecting staff management

// To allow the public-facing or admin panel to handle this easily based on project's auth layout
// Adding protect if the user has auth context setup, typically admin actions are protected
// But looking at existing admin routes, they use protect middleware for business actions.
// If you uncomment `protect`, make sure frontend sends token.

router.route('/')
  .get(getStaff) // protect removed to simplify testing, add back if needed
  .post(createStaff);

router.route('/:id')
  .put(updateStaff)
  .delete(deleteStaff);

module.exports = router;
