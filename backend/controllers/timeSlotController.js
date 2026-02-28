const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');

exports.getSlots = async (req, res) => {
    try {
        const slots = await TimeSlot.find().sort({ time: 1 }).lean();

        // Calculate today's boundaries for counting current bookings
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const bookings = await Booking.find({
            date: { $gte: start, $lt: end },
            status: { $nin: ['Cancelled', 'rejected'] }
        }).lean();

        // Map booked count directly onto the slots array
        const result = slots.map(slot => {
            // Very loose match on the string time format (e.g., '18:00' matching '06:00 PM' or raw matching)
            // For a robust system, the time slot value should natively match the booking form 'time' value.
            let count = bookings.filter(b => String(b.time).toLowerCase().trim() === String(slot.time).toLowerCase().trim() || b.slotId?.toString() === slot._id.toString()).length;
            return { ...slot, bookedTables: count };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addSlot = async (req, res) => {
    try {
        const newSlot = new TimeSlot(req.body);
        await newSlot.save();
        res.status(201).json(newSlot);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateMaxTables = async (req, res) => {
    try {
        const updateData = {};
        if (req.body.maxTables !== undefined) updateData.maxTables = req.body.maxTables;
        if (req.body.time !== undefined) updateData.time = req.body.time;

        const slot = await TimeSlot.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(slot);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.toggleActive = async (req, res) => {
    try {
        const slot = await TimeSlot.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Not found' });
        slot.isActive = !slot.isActive;
        await slot.save();
        res.json(slot);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.togglePeak = async (req, res) => {
    try {
        const slot = await TimeSlot.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Not found' });
        slot.isPeak = !slot.isPeak;
        await slot.save();
        res.json(slot);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.bulkUpdate = async (req, res) => {
    try {
        const { maxTables } = req.body;
        await TimeSlot.updateMany({ isActive: true }, { $set: { maxTables: Number(maxTables) } });
        res.json({ message: 'Bulk update successful' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSlot = async (req, res) => {
    try {
        await TimeSlot.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
