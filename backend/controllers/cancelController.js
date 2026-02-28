const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { sendOTPEmail, sendCancellationConfirmedEmail } = require('../utils/sendEmail');
const { generateOTP } = require('../utils/uniqueIdHelper');

const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `***@${domain}`;
    return `${user.slice(0, 2)}***@${domain}`;
};

// STEP 1 & 2: FIND BOOKING
exports.findBooking = async (req, res) => {
    try {
        const { uniqueBookingId, type } = req.body;

        let booking;
        if (type === 'table') {
            booking = await Booking.findOne({ uniqueBookingId }).populate('customerId');
        } else if (type === 'event') {
            booking = await Event.findOne({ uniqueBookingId });
        } else {
            return res.status(400).json({ message: 'Invalid booking type' });
        }

        if (!booking) {
            return res.status(404).json({ message: 'Invalid Booking ID. Please check and try again.' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'This booking is already cancelled.' });
        }

        const email = type === 'table' ? booking.customerId.email : booking.email;
        const name = type === 'table' ? booking.customerId.name : booking.name;
        const date = type === 'table' ? booking.date : booking.eventDate;
        const time = type === 'table' ? booking.time : booking.timeSlot;

        res.status(200).json({
            name,
            date,
            time,
            type: type === 'table' ? 'Table Reservation' : 'Private Event',
            status: booking.status,
            maskedEmail: maskEmail(email)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STEP 3: SEND OTP
exports.sendCancellationOTP = async (req, res) => {
    try {
        const { uniqueBookingId, type } = req.body;
        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        let booking;
        if (type === 'table') {
            booking = await Booking.findOne({ uniqueBookingId }).populate('customerId');
        } else {
            booking = await Event.findOne({ uniqueBookingId });
        }

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.otp = otp;
        booking.otpExpiry = expiry;
        await booking.save();

        const email = type === 'table' ? booking.customerId.email : booking.email;
        await sendOTPEmail(email, otp);

        res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// STEP 4: VERIFY OTP & CANCEL
exports.verifyAndCancel = async (req, res) => {
    try {
        const { uniqueBookingId, type, otp } = req.body;

        let booking;
        if (type === 'table') {
            booking = await Booking.findOne({ uniqueBookingId }).populate('customerId');
        } else {
            booking = await Event.findOne({ uniqueBookingId });
        }

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Try again.' });
        }

        if (Date.now() > booking.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired. Please resend.' });
        }

        // CANCEL
        booking.status = 'cancelled';
        booking.otp = undefined;
        booking.otpExpiry = undefined;
        await booking.save();

        const email = type === 'table' ? booking.customerId.email : booking.email;
        await sendCancellationConfirmedEmail(email, uniqueBookingId);

        res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
