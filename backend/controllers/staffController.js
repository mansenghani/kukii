const Staff = require('../models/Staff');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Public / Admin
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch staff data', error: err.message });
  }
};

// @desc    Create new staff
// @route   POST /api/staff
// @access  Public / Admin
const createStaff = async (req, res) => {
  try {
    const { name, role, contact, shift, status, avatar } = req.body;
    
    const newStaff = new Staff({
      name,
      role,
      contact,
      shift,
      status: status || 'ACTIVE',
      avatar: avatar || '',
      initials: name ? name.substring(0, 2).toUpperCase() : 'NS'
    });

    const savedStaff = await newStaff.save();
    res.status(201).json(savedStaff);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create staff record', error: err.message });
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Public / Admin
const updateStaff = async (req, res) => {
  try {
    const { name, role, contact, shift, status, avatar } = req.body;
    
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.name = name || staff.name;
    staff.role = role || staff.role;
    staff.contact = contact || staff.contact;
    staff.shift = shift || staff.shift;
    staff.status = status || staff.status;
    staff.avatar = avatar !== undefined ? avatar : staff.avatar;
    
    // Automatically re-generate initials if name changed
    if (name) {
      staff.initials = name.substring(0, 2).toUpperCase();
    }

    const updatedStaff = await staff.save();
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update staff record', error: err.message });
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Public / Admin
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    res.json({ message: 'Staff member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete staff', error: err.message });
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
