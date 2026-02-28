const Booking = require('../models/Booking');
const Event = require('../models/Event');
const PreOrder = require('../models/PreOrder');

// GET /api/dashboard/summary-cards
exports.getSummaryCards = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalPreOrders = await PreOrder.countDocuments();

        const revenueData = await PreOrder.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } }
        ]);

        res.status(200).json({
            bookings: totalBookings,
            events: totalEvents,
            preOrders: totalPreOrders,
            revenue: revenueData[0]?.total || 0,
            trends: {
                bookings: "+12%",
                events: "+5%",
                preOrders: "+8%",
                revenue: "+15%"
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/daily-bookings
exports.getDailyBookings = async (req, res) => {
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const data = await Booking.aggregate([
            { $match: { date: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Map to day names for frontend display
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const formattedData = data.map(item => ({
            day: dayNames[new Date(item._id).getDay()],
            count: item.count
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/monthly-revenue
exports.getMonthlyRevenue = async (req, res) => {
    try {
        const data = await PreOrder.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$grandTotal" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedData = data.map(item => ({
            month: monthNames[parseInt(item._id.split('-')[1]) - 1],
            revenue: item.revenue
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/booking-status
exports.getBookingStatus = async (req, res) => {
    try {
        const data = await Booking.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/top-items
exports.getTopItems = async (req, res) => {
    try {
        const data = await PreOrder.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/dashboard/peak-slots
exports.getPeakSlots = async (req, res) => {
    try {
        const data = await Booking.aggregate([
            { $group: { _id: "$time", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
