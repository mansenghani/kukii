const Feedback = require('../models/Feedback');

// USER CONTROLLERS

// @desc    Submit feedback
// @route   POST /api/feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { name, email, rating, message } = req.body;
        // In case previous code used 'review' field, map it to message for compatibility
        const feedbackContent = message || req.body.review;

        const newFeedback = new Feedback({
            name,
            email,
            rating,
            message: feedbackContent,
            status: 'pending' // Force pending on submission
        });

        const savedFeedback = await newFeedback.save();
        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully!',
            data: savedFeedback
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get only approved feedback for public display
// @route   GET /api/feedback/approved
exports.getApprovedFeedback = async (req, res) => {
    try {
        const approvedFeedback = await Feedback.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.status(200).json(approvedFeedback);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ADMIN CONTROLLERS

// @desc    Get all feedback including pending
// @route   GET /api/admin/feedback
exports.getAllFeedback = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const totalRecords = await Feedback.countDocuments();
        const totalPages = Math.ceil(totalRecords / limit);

        const feedbacks = await Feedback.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            data: feedbacks,
            totalRecords,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get full single review
// @route   GET /api/admin/feedback/:id
exports.getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark as approved
// @route   PUT /api/admin/feedback/:id/approve
exports.approveFeedback = async (req, res) => {
    try {
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        if (!updatedFeedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.status(200).json({ success: true, message: 'Feedback approved successfully', data: updatedFeedback });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Mark as rejected
// @route   PUT /api/admin/feedback/:id/reject
exports.rejectFeedback = async (req, res) => {
    try {
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!updatedFeedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.status(200).json({ success: true, message: 'Feedback rejected successfully', data: updatedFeedback });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Keep existing methods for backward compatibility if needed, but updated for lowercase status
exports.createFeedback = exports.submitFeedback;
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { status: status.toLowerCase() },
            { new: true }
        );
        if (!updatedFeedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
        res.json(updatedFeedback);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        await Feedback.findByIdAndDelete(id);
        res.json({ success: true, message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
