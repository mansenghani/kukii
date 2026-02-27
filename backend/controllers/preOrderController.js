const PreOrder = require('../models/PreOrder');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const MenuItem = require('../models/MenuItem');

// @desc    Create a new pre-order
// @route   POST /api/preorders
exports.createPreOrder = async (req, res) => {
  try {
    const { bookingId, type, items } = req.body;

    // Verify booking exists
    let booking;
    if (type === 'table') {
      booking = await Booking.findById(bookingId);
    } else {
      booking = await Event.findById(bookingId);
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // RELAXED RESTRICTION: Pre-orders can now be created for any booking status (Pending, Approved, etc.)

    // Calculate totals server-side
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.name} not found` });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      processedItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    const tax = subtotal * 0.05; // 5% tax
    const grandTotal = subtotal + tax;

    const preOrder = new PreOrder({
      bookingId,
      type,
      typeModel: type === 'table' ? 'Booking' : 'Event',
      items: processedItems,
      subtotal,
      tax,
      grandTotal,
      status: 'pending' // Default status is pending
    });

    const savedPreOrder = await preOrder.save();

    // Attach to booking
    booking.preOrderId = savedPreOrder._id;
    await booking.save();

    res.status(201).json(savedPreOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pre-order by booking ID
// @route   GET /api/preorders/:bookingId
exports.getPreOrderByBookingId = async (req, res) => {
  try {
    const preOrder = await PreOrder.findOne({ bookingId: req.params.bookingId })
      .populate('items.menuItemId');

    if (!preOrder) {
      return res.status(404).json({ message: 'Pre-order not found' });
    }

    res.status(200).json(preOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pre-orders (Admin)
// @route   GET /api/admin/preorders
exports.getAdminPreOrders = async (req, res) => {
  try {
    const Customer = require('../models/Customer');

    let preOrders = await PreOrder.find()
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .lean();

    // Manually attach customer details for 'table' bookings to avoid silent Mongoose deep populate failures
    for (let order of preOrders) {
      if (order.type === 'table' && order.bookingId && order.bookingId.customerId) {
        const customerInfo = await Customer.findById(order.bookingId.customerId).lean();
        if (customerInfo) {
          order.bookingId.customerId = customerInfo;
        }
      }
    }

    res.status(200).json(preOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update pre-order status
// @route   PUT /api/admin/preorders/:id/status
exports.updatePreOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const preOrder = await PreOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!preOrder) {
      return res.status(404).json({ message: 'Pre-order not found' });
    }

    res.status(200).json(preOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
exports.getPreOrderStats = async (req, res) => {
  try {
    const stats = await PreOrder.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$grandTotal', 0] } },
                pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
              }
            }
          ],
          popularItems: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.name',
                count: { $sum: '$items.quantity' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    res.status(200).json({
      summary: stats[0].totals[0] || { totalRevenue: 0, pendingCount: 0, approvedCount: 0 },
      popularItems: stats[0].popularItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
