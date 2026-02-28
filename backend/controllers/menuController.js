const MenuItem = require('../models/MenuItem');
const fs = require('fs');
const path = require('path');

exports.getMenuItems = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'All' && category !== 'all') {
      filter.categoryId = category; // assuming the frontend passes the category ID
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalRecords = await MenuItem.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    const menuItems = await MenuItem.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: menuItems,
      totalRecords,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { categoryId, name, description, price, availability, isAvailable } = req.body;

    let imagePath = '';
    if (req.file) {
      // Use relative path starting with uploads/ for DB consistency
      imagePath = `uploads/${req.file.filename}`;
    }

    const newMenuItem = new MenuItem({
      categoryId,
      name,
      description,
      price: parseFloat(price),
      image: imagePath,
      availability: availability === 'true' || availability === true,
      isAvailable: isAvailable === 'true' || isAvailable === true
    });

    await newMenuItem.save();
    res.status(201).json(newMenuItem);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { categoryId, name, description, price, availability, isAvailable } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    // Update fields only if they are provided in the body
    if (categoryId) menuItem.categoryId = categoryId;
    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = parseFloat(price);

    // Checkboxes sent via FormData are strings "true"/"false"
    if (availability !== undefined) {
      menuItem.availability = availability === 'true' || availability === true;
    }
    if (isAvailable !== undefined) {
      menuItem.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    if (req.file) {
      // Delete old image file if it exists
      if (menuItem.image) {
        const oldPath = path.join(__dirname, '..', menuItem.image);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
      }
      // Save new relative path
      menuItem.image = `uploads/${req.file.filename}`;
    }

    const updatedMenuItem = await menuItem.save();
    // Re-populate for response
    await updatedMenuItem.populate('categoryId', 'name');

    res.status(200).json(updatedMenuItem);
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) { }
    }
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    if (menuItem.image) {
      const filePath = path.join(__dirname, '..', menuItem.image);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete image file:", err);
        }
      }
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
