const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { sendOTPEmail, sendCancellationConfirmedEmail } = require('../utils/sendEmail');
const { generateOTP } = require('../utils/uniqueIdHelper');

const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `***@${domain}`;
    return `${user.slice(0, 2)}***@${domain}`;
};

// STEP 1: Send OTP to Customer
exports.sendOTP = async (req, res) => {
    try {
        const { bookingId, type } = req.body;
        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        let booking;
        if (type === 'table') {
            booking = await Booking.findById(bookingId).populate('customerId');
        } else if (type === 'event') {
            booking = await Event.findById(bookingId);
        } else {
            return res.status(400).json({ success: false, message: "Invalid type" });
        }

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        booking.otp = otp;
        booking.otpExpiry = expiry;
        await booking.save();

        const email = type === 'table' ? booking.customerId.email : booking.email;
        const name = type === 'table' ? booking.customerId.name : booking.name;

        // Use the updated sendOTPEmail which now takes (data, otp, type)
        await sendOTPEmail(booking, otp, type);

        res.status(200).json({
            success: true,
            message: "OTP sent to customer email",
            maskedEmail: maskEmail(email)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// STEP 2: Verify OTP & Cancel Booking
exports.verifyOTP = async (req, res) => {
    try {
        const { bookingId, otp, type } = req.body;

        let booking;
        if (type === 'table') {
            booking = await Booking.findById(bookingId).populate('customerId');
        } else {
            booking = await Event.findById(bookingId);
        }

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (Date.now() > booking.otpExpiry) {
            return res.status(400).json({ success: false, message: "OTP expired. Resend OTP." });
        }

        // Apply shared cancellation logic
        booking.status = 'cancelled';
        booking.otp = null;
        booking.otpExpiry = null;
        await booking.save();

        const email = type === 'table' ? booking.customerId.email : booking.email;
        await sendCancellationConfirmedEmail(booking, type);

        res.status(200).json({ success: true, message: `Booking ${booking.uniqueBookingId} cancelled successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// STEP 3: Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { bookingId, type } = req.body;
        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000;

        let booking;
        if (type === 'table') {
            booking = await Booking.findById(bookingId).populate('customerId');
        } else {
            booking = await Event.findById(bookingId);
        }

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        booking.otp = otp;
        booking.otpExpiry = expiry;
        await booking.save();

        const email = type === 'table' ? booking.customerId.email : booking.email;
        await sendOTPEmail(booking, otp, type);

        res.status(200).json({ success: true, message: "OTP resent" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
