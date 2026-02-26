const FooterSettings = require('../models/FooterSettings');

// @desc    Get footer settings
// @route   GET /api/admin/footer
exports.getFooterSettings = async (req, res) => {
    try {
        let settings = await FooterSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await FooterSettings.create({});
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update footer settings
// @route   PUT /api/admin/footer
exports.updateFooterSettings = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedAt: Date.now()
        };

        const settings = await FooterSettings.findOneAndUpdate(
            {}, // Find first document
            updateData,
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
