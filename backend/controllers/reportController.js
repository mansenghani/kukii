const Booking = require('../models/Booking');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// @desc    Get daily booking report
// @route   GET /api/admin/reports/daily
exports.getDailyReport = async (req, res) => {
    try {
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];
        const startOfDay = new Date(dateStr);
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        const stats = await Booking.aggregate([
            { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } }
                }
            }
        ]);

        res.status(200).json(stats[0] || { totalBookings: 0, totalRevenue: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly reservation report
// @route   GET /api/admin/reports/monthly
exports.getMonthlyReport = async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const stats = await Booking.aggregate([
            {
                $facet: {
                    current: [
                        { $match: { date: { $gte: currentMonth, $lt: nextMonth } } },
                        { $group: { _id: null, count: { $sum: 1 } } }
                    ],
                    previous: [
                        { $match: { date: { $gte: prevMonth, $lt: currentMonth } } },
                        { $group: { _id: null, count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        const currentCount = stats[0].current[0]?.count || 0;
        const prevCount = stats[0].previous[0]?.count || 0;

        let growth = 0;
        if (prevCount > 0) {
            growth = (((currentCount - prevCount) / prevCount) * 100).toFixed(1);
        } else if (currentCount > 0) {
            growth = 100;
        }

        res.status(200).json({ currentCount, prevCount, growth });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top ordered food
// @route   GET /api/admin/reports/top-food
exports.getTopFood = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const items = await MenuItem.find().sort({ totalOrdered: -1 }).limit(limit);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get peak hour booking
// @route   GET /api/admin/reports/peak-hours
exports.getPeakHours = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            { $match: { time: { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$time',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        res.status(200).json(stats[0] || { _id: 'N/A', count: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer visit frequency
// @route   GET /api/admin/reports/visit-frequency
exports.getVisitFrequency = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: '$customerId',
                    visitCount: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    repeatCustomers: { $sum: { $cond: [{ $gt: ['$visitCount', 1] }, 1, 0] } },
                    totalCustomers: { $sum: 1 }
                }
            }
        ]);

        if (stats.length === 0) return res.status(200).json({ repeatPercentage: 0 });

        const repeatPercentage = ((stats[0].repeatCustomers / stats[0].totalCustomers) * 100).toFixed(0);
        res.status(200).json({ repeatPercentage, total: stats[0].totalCustomers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get transactions for table
// @route   GET /api/admin/reports/transactions
exports.getTransactions = async (req, res) => {
    try {
        const { from, to, type, search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                query.date.$lte = endDate;
            }
        }

        if (type && type !== 'All Transactions') {
            if (type === 'Reservations Only') {
                // Already filtering bookings
            } else if (type === 'Revenue Analysis') {
                query.status = 'Completed';
            }
        }

        const skip = (page - 1) * limit;

        // Note: For search we'd normally populate and filter, 
        // but for deep MongoDB performance it's better to get IDs first or use aggregate
        const transactions = await Booking.find(query)
            .populate('customerId', 'name')
            .populate('tableId', 'tableNumber')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            data: transactions,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export reports as PDF
// @route   GET /api/admin/reports/export/pdf
exports.exportPDF = async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};
        if (from && to) {
            query.date = { $gte: new Date(from), $lte: new Date(to) };
        }

        const data = await Booking.find(query).populate('customerId', 'name').populate('tableId', 'tableNumber');

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('KUKI Restaurant - Performance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();

        data.forEach((item, i) => {
            doc.text(`${i + 1}. Date: ${item.date.toLocaleDateString()} | Customer: ${item.customerId?.name || 'N/A'} | Table: ${item.tableId?.tableNumber || 'N/A'} | Status: ${item.status} | Amount: ₹${item.totalAmount}`);
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export reports as Excel
// @route   GET /api/admin/reports/export/excel
exports.exportExcel = async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};
        if (from && to) {
            query.date = { $gte: new Date(from), $lte: new Date(to) };
        }

        const data = await Booking.find(query).populate('customerId', 'name').populate('tableId', 'tableNumber');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transactions');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer', key: 'customer', width: 30 },
            { header: 'Table', key: 'table', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Amount', key: 'amount', width: 15 }
        ];

        data.forEach(item => {
            worksheet.addRow({
                date: item.date.toLocaleDateString(),
                customer: item.customerId?.name || 'N/A',
                table: item.tableId?.tableNumber || 'N/A',
                status: item.status,
                amount: item.totalAmount
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
