const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id, version) => {
    return jwt.sign({ id, version }, process.env.JWT_SECRET || 'kuki_secret_key', {
        expiresIn: '30d'
    });
};

// @desc    Admin login
// @route   POST /api/admin/login
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.comparePassword(password))) {
            res.json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id, admin.tokenVersion)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
exports.updateAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);

        if (admin) {
            admin.name = req.body.name || admin.name;
            admin.email = req.body.email || admin.email;

            const updatedAdmin = await admin.save();

            res.json({
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                token: generateToken(updatedAdmin._id, updatedAdmin.tokenVersion)
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin._id);

        if (admin && (await admin.comparePassword(oldPassword))) {
            admin.password = newPassword;
            await admin.save();
            res.json({ message: 'Password changed successfully' });
        } else {
            res.status(401).json({ message: 'Invalid old password' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Logout all sessions (invalidate tokens)
// @route   POST /api/admin/logout-all
exports.logoutAllSessions = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        if (admin) {
            admin.tokenVersion += 1;
            await admin.save();
            res.json({ message: 'All sessions logged out successfully' });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
