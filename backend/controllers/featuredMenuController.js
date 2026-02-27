const FeaturedMenu = require('../models/FeaturedMenu');
const MenuItem = require('../models/MenuItem');

// @desc    Get featured menu items
// @route   GET /api/featured-menu
exports.getFeaturedMenu = async (req, res) => {
    try {
        const featured = await FeaturedMenu.findOne().populate('menuIds');
        if (!featured) {
            return res.status(200).json({ menuIds: [] });
        }
        res.status(200).json(featured);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update featured menu items
// @route   PUT /api/featured-menu
// @access  Private/Admin
exports.updateFeaturedMenu = async (req, res) => {
  try {
    const { menuIds } = req.body;

    if (!Array.isArray(menuIds) || menuIds.length !== 3) {
      return res.status(400).json({
        message: "Exactly 3 menu items must be selected.",
      });
    }

    const featured = await FeaturedMenu.findOneAndUpdate(
      {},
      { menuIds },
      { returnDocument: "after", upsert: true },
    ).populate("menuIds");

    res.status(200).json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
