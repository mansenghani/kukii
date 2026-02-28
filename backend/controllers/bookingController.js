const Booking = require('../models/Booking');
const Event = require('../models/Event');
const BookingSettings = require('../models/BookingSettings');
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

    // Validation: Check if another booking exists with same tableId, same date, same time, status is NOT rejected
    const existingBooking = await Booking.findOne({
      tableId,
      date: new Date(date),
      time,
      status: 'approved' // Only approved bookings block a table
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Table already booked for selected date and time' });
    }

    // Fetch booking settings for auto confirmation
    const settings = await BookingSettings.findOne();
    const isAutoApprove = settings ? settings.autoConfirmation : false;

    const booking = new Booking({
      customerId,
      tableId,
      date: new Date(date),
      time,
      guests,
      status: isAutoApprove ? 'approved' : 'pending'
    });

    await booking.save();

    // Trigger instant email notification if auto-approved
    if (isAutoApprove) {
      const populatedBooking = await Booking.findById(booking._id)
        .populate('customerId')
        .populate('tableId');

      (async () => {
        try {
          await sendUserBookingEmail(populatedBooking, 'approved');
          await sendAdminNotificationEmail(populatedBooking);
        } catch (emailErr) {
          console.error("Auto-Approve Email Notification Error:", emailErr);
        }
      })();
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalRecords = await Booking.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    const bookings = await Booking.find()
      .populate('customerId')
      .populate('tableId')
      .populate('preOrderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: bookings,
      totalRecords,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const originalBooking = await Booking.findById(req.params.id);
    if (!originalBooking) return res.status(404).json({ message: 'Booking not found' });

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customerId')
      .populate('tableId')
      .populate('preOrderId');

    // Email Notification Logic - ONLY if status changed and is approved/rejected
    if (status && status !== originalBooking.status) {
      if (status === 'approved' || status === 'rejected') {
        (async () => {
          try {
            await sendUserBookingEmail(updatedBooking, status);
            await sendAdminNotificationEmail(updatedBooking);
          } catch (emailErr) {
            console.error("Email Notification Background Error:", emailErr);
          }
        })();
      }
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(400).json({ message: error.message });
  }
};
exports.updatePreorderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { preorderStatus: status },
      { new: true }
    ).populate('customerId').populate('tableId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // If skipped, we simply return success. No auto-email as per requirements.
    if (status === 'skipped') {
      console.log(`Preorder skipped for booking: ${req.params.id}`);
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
