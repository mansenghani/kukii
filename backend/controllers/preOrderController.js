const PreOrder = require('../models/PreOrder');
const Booking = require('../models/Booking');

exports.createPreOrder = async (req, res) => {
  try {
    const { bookingId, items, totalAmount } = req.body;

    // Validation: PreOrder can only be created if Booking status is Confirmed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'PreOrder can only be created for confirmed bookings' });
    }

    const preOrder = new PreOrder({
      bookingId,
      items,
      totalAmount,
      status: 'Preparing'
    });

    await preOrder.save();
    res.status(201).json(preOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPreOrders = async (req, res) => {
  try {
    const preOrders = await PreOrder.find().populate('bookingId').populate('items.menuId');
    res.status(200).json(preOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(preOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
