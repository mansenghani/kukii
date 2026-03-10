const Booking = require('../models/Booking');
const Event = require('../models/Event');
const PreOrder = require('../models/PreOrder');
const { sendUserBookingEmail } = require('../utils/sendEmail');

exports.getPendingNotifications = async (req, res) => {
    try {
        const [pendingBookings, pendingEvents, pendingPreOrders] = await Promise.all([
            Booking.find({ status: 'pending' }).populate('customerId').populate('tableId').sort({ createdAt: -1 }),
            Event.find({ status: 'pending' }).sort({ createdAt: -1 }),
            PreOrder.find({ status: 'pending' }).populate('bookingId').sort({ createdAt: -1 })
        ]);

        // Transform bookings
        const transformedBookings = pendingBookings.map(b => ({
            id: b._id,
            customerName: b.customerId ? b.customerId.name : 'Unknown',
            details: `Table: ${b.tableId ? (b.tableId.number || b.tableId.name) : 'N/A'}`,
            dateTime: `${new Date(b.date).toLocaleDateString()} – ${b.time}`,
            type: 'Table Booking',
            status: b.status,
            model: 'Booking'
        }));

        // Transform events
        const transformedEvents = pendingEvents.map(e => ({
            id: e._id,
            customerName: e.name,
            details: `Guests: ${e.guests}`,
            dateTime: `${new Date(e.eventDate).toLocaleDateString()} – ${e.timeSlot}`,
            type: 'Event Reservation',
            status: e.status,
            model: 'Event'
        }));

        // Transform pre-orders
        const transformedPreOrders = pendingPreOrders.map(p => ({
            id: p._id,
            customerName: p.typeModel === 'Booking' && p.bookingId ? 'Booking Order' : 'Event Order',
            details: `Total: ${p.grandTotal}`,
            dateTime: `${new Date(p.createdAt).toLocaleDateString()}`,
            type: 'Pre-Order',
            status: p.status,
            model: 'PreOrder'
        }));

        const allNotifications = [...transformedBookings, ...transformedEvents, ...transformedPreOrders]
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        res.status(200).json(allNotifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateNotificationStatus = async (req, res) => {
    try {
        const { id, model, status } = req.body;

        let updatedItem;
        if (model === 'Booking') {
            updatedItem = await Booking.findByIdAndUpdate(id, { status }, { new: true }).populate('customerId').populate('tableId');
            if (updatedItem && (status === 'approved' || status === 'rejected')) {
                await sendUserBookingEmail(updatedItem, status);
            }
        } else if (model === 'Event') {
            updatedItem = await Event.findByIdAndUpdate(id, { status }, { new: true });
            // Add event specific email if needed
        } else if (model === 'PreOrder') {
            updatedItem = await PreOrder.findByIdAndUpdate(id, { status }, { new: true });
        }

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
