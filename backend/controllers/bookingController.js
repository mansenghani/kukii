const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { sendUserBookingEmail, sendAdminNotificationEmail } = require('../utils/sendEmail');

exports.createBooking = async (req, res) => {
  try {
    const { customerId, tableId, date, time, guests } = req.body;

    // Check if an approved event encompasses this date and time
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const hour = parseInt(time.split(':')[0], 10);

    let overlappingSlot = null;
    if (hour >= 10 && hour < 14) overlappingSlot = '10:00 AM - 02:00 PM';
    if (hour >= 18 && hour < 22) overlappingSlot = '06:00 PM - 10:00 PM';

    if (overlappingSlot) {
      const conflictEvent = await Event.findOne({
        eventDate: bookingDate,
        timeSlot: overlappingSlot,
        status: 'approved'
      });

      if (conflictEvent) {
        return res.status(400).json({ message: 'This time slot is reserved for a private event.' });
      }
    }

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
    const bookings = await Booking.find()
      .populate('customerId')
      .populate('tableId')
      .populate('preOrderId');

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // 1. Update the booking
    const originalBooking = await Booking.findById(req.params.id);
    if (!originalBooking) return res.status(404).json({ message: 'Booking not found' });

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customerId')
      .populate('tableId')
      .populate('preOrderId');

    // 2. Handle Pre-Order Cleanup if Cancelled
    if (status === 'Cancelled' && booking.preOrderId) {
      const PreOrder = require('../models/PreOrder');
      await PreOrder.findByIdAndDelete(booking.preOrderId);
      booking.preOrderId = undefined;
      await booking.save();
    }

    // 3. Email Notification Logic
    // Only send if status changed
    if (status && status !== originalBooking.status) {
      if (status === 'Confirmed' || status === 'Cancelled') {
        // Trigger emails in background (do not block response)
        (async () => {
          try {
            await sendUserBookingEmail(booking, status);
            await sendAdminNotificationEmail(booking);
          } catch (emailErr) {
            console.error("Email Notification Background Error:", emailErr);
          }
        })();
      }
    }

    res.status(200).json(booking);

  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(400).json({ message: error.message });
  }
};

