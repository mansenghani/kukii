const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const { sendUserBookingEmail, sendAdminNotificationEmail } = require('../utils/sendEmail');

// Helper to check if a booking time "HH:mm" falls into a named time slot
const fallsInSlot = (timeStr, timeSlot) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (timeSlot === '10:00 AM - 02:00 PM') {
        return hour >= 10 && hour < 14;
    }
    if (timeSlot === '06:00 PM - 10:00 PM') {
        return hour >= 18 && hour < 22;
    }
    return false;
};

exports.createEvent = async (req, res) => {
    try {
        const { name, phone, email, eventDate, timeSlot, guests, specialRequest } = req.body;
        const targetDate = new Date(eventDate);
        targetDate.setHours(0, 0, 0, 0);

        // 1. Check if Event already exists for this slot (Pending or Approved)
        const existingEvent = await Event.findOne({
            eventDate: targetDate,
            timeSlot,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingEvent) {
            return res.status(400).json({ message: 'An event is already scheduled for this time slot.' });
        }

        // 2. Check table bookings for this date
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const bookingsOnDate = await Booking.find({
            date: { $gte: targetDate, $lt: nextDay },
            status: { $ne: 'Cancelled' }
        });

        const totalTables = await Table.countDocuments();
        const uniqueTablesOnDate = new Set(bookingsOnDate.map(b => b.tableId.toString())).size;

        if (totalTables > 0 && uniqueTablesOnDate >= totalTables * 2) {
            // Simple heuristic to say whole day is fully booked
            return res.status(400).json({ message: 'Tables are fully booked for this date. Event booking not available.' });
        }

        // 3. Check if tables are booked for the specific time slot
        const bookingsInSlot = bookingsOnDate.filter(b => fallsInSlot(b.time, timeSlot));

        if (bookingsInSlot.length > 0) {
            return res.status(400).json({ message: 'Tables are already booked for this time. Please select another slot or date.' });
        }

        // 4. Create pending event
        const newEvent = new Event({
            name, phone, email, eventDate: targetDate, timeSlot, guests, specialRequest, status: 'pending'
        });

        await newEvent.save();

        // Notify Admin of new pending event
        (async () => {
            try {
                await sendAdminNotificationEmail(newEvent);
            } catch (err) {
                console.error("Admin Event Email Error:", err);
            }
        })();

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const { date, slot } = req.query;
        if (!date || !slot) return res.status(400).json({ message: 'Missing date or slot' });

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const existingEvent = await Event.findOne({
            eventDate: targetDate,
            timeSlot: slot,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingEvent) {
            return res.status(200).json({ available: false, reason: 'An event is already scheduled for this time slot.' });
        }

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const bookingsOnDate = await Booking.find({
            date: { $gte: targetDate, $lt: nextDay },
            status: { $ne: 'Cancelled' }
        });

        const bookingsInSlot = bookingsOnDate.filter(b => fallsInSlot(b.time, slot));
        if (bookingsInSlot.length > 0) {
            return res.status(200).json({ available: false, reason: 'Tables are already booked for this time.' });
        }

        res.status(200).json({ available: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Methods
exports.getAdminEvents = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status && status !== 'All') {
            filter.status = status.toLowerCase();
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const totalRecords = await Event.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limit);

        const events = await Event.find(filter)
            .populate('preOrderId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            data: events,
            totalRecords,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('preOrderId');

        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEventStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('preOrderId');
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Email Notification Logic for Events
        if (status === 'approved' || status === 'rejected') {
            (async () => {
                try {
                    await sendUserBookingEmail(event, status);
                    await sendAdminNotificationEmail(event);
                } catch (emailErr) {
                    console.error("Event Status Email Error:", emailErr);
                }
            })();
        }

        if (status === 'rejected' && event.preOrderId) {
            const PreOrder = require('../models/PreOrder');
            await PreOrder.findByIdAndDelete(event.preOrderId);
            event.preOrderId = undefined;
            await event.save();
        }

        res.status(200).json(event);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createAdminEvent = async (req, res) => {
    try {
        const { name, phone, email, eventDate, timeSlot, guests, specialRequest } = req.body;
        const targetDate = new Date(eventDate);
        targetDate.setHours(0, 0, 0, 0);

        // Conflict checking is omitted or logged, assuming Admin has override capability, but let's check basic table overlap
        const existingEvent = await Event.findOne({
            eventDate: targetDate,
            timeSlot,
            status: 'approved'
        });

        if (existingEvent) {
            return res.status(400).json({ message: 'An approved event already exists for this slot.' });
        }

        const newEvent = new Event({
            name, phone, email, eventDate: targetDate, timeSlot, guests, specialRequest, status: 'approved'
        });

        await newEvent.save();

        // Send confirmation email to both user and admin for admin-created booking
        (async () => {
            try {
                await sendUserBookingEmail(newEvent, 'approved');
                await sendAdminNotificationEmail(newEvent);
            } catch (err) {
                console.error("Admin Creative Event Email Error:", err);
            }
        })();

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
