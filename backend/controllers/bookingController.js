const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  try {
    const { customerId, tableId, date, time, guests } = req.body;

    // Validation: Check if another booking exists with same tableId, same date, same time, status is NOT Cancelled
    const existingBooking = await Booking.findOne({
      tableId,
      date: new Date(date),
      time,
      status: { $ne: 'Cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Table already booked for selected date and time' });
    }

    const booking = new Booking({
      customerId,
      tableId,
      date: new Date(date),
      time,
      guests,
      status: 'Pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('customerId').populate('tableId');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
