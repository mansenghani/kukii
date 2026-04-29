const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { sendAutoCancelEmail, sendInvoiceEmail, sendAutoInvoiceEmail } = require('./sendEmail');
const { generateInvoicePDF } = require('./pdfGenerator');

const autoCancelNoShows = async () => {
    const graceTimeMinutes = 30;
    const now = new Date();

    try {
        // Handle Table Bookings
        const tableBookings = await Booking.find({ 
            status: { $in: ['Reserved', 'approved', 'confirmed'] } 
        }).populate('customerId');

        for (const booking of tableBookings) {
            const slotTime = new Date(booking.date);
            
            // Handle AM/PM properly
            let hours = 0;
            let minutes = 0;
            const timeStr = booking.time.toLowerCase();
            
            if (timeStr.includes('am') || timeStr.includes('pm')) {
                const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/);
                if (match) {
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    const period = match[3];
                    if (period === 'pm' && hours < 12) hours += 12;
                    if (period === 'am' && hours === 12) hours = 0;
                }
            } else {
                const [h, m] = timeStr.split(':');
                hours = parseInt(h);
                minutes = parseInt(m);
            }

            slotTime.setHours(hours, minutes, 0, 0);

            const expiryTime = new Date(slotTime.getTime() + graceTimeMinutes * 60000);

            if (now > expiryTime) {
                booking.status = 'Cancelled';
                await booking.save();
                console.log(`Auto-cancelled table booking ${booking.uniqueBookingId}`);
                await sendAutoCancelEmail(booking, 'table');
            }
        }

        // Handle Events
        const events = await Event.find({ status: { $in: ['Reserved', 'approved'] } });
        for (const event of events) {
            // Event time slots are ranges like '10:00 AM - 02:00 PM'
            // We'll take the start time
            const startTimeStr = event.timeSlot.split(' - ')[0];
            const slotTime = new Date(event.eventDate);
            
            let [time, modifier] = startTimeStr.split(' ');
            let [hours, minutes] = time.split(':');
            if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
            if (modifier === 'AM' && hours === '12') hours = 0;
            
            slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const expiryTime = new Date(slotTime.getTime() + graceTimeMinutes * 60000);

            if (now > expiryTime) {
                event.status = 'Cancelled';
                await event.save();
                console.log(`Auto-cancelled event booking ${event.uniqueBookingId}`);
                await sendAutoCancelEmail(event, 'event');
            }
        }
    } catch (error) {
        console.error('Error in auto-cancel scheduler:', error);
    }
};

const autoSendInvoices = async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    try {
        const eligibleBookings = await Booking.find({
            status: { $in: ['Checked-in', 'Seated'] },
            checkInTime: { $lte: twoHoursAgo },
            invoiceSent: { $ne: true },
            preOrderId: { $exists: true, $ne: null }
        }).populate('customerId').populate('tableId').populate('preOrderId');

        for (const booking of eligibleBookings) {
            // Verify pre-order items exist and are not empty
            if (booking.preOrderId && booking.preOrderId.items && booking.preOrderId.items.length > 0) {
                try {
                    // Generate PDF
                    const pdfBuffer = await generateInvoicePDF(booking);
                    
                    // Send Email
                    await sendAutoInvoiceEmail(booking, pdfBuffer);
                    
                    // Update Booking
                    booking.invoiceSent = true;
                    booking.invoiceSentAt = new Date();
                    await booking.save();
                    
                    console.log(`Auto-invoice sent for booking ${booking.uniqueBookingId}`);
                } catch (err) {
                    console.error(`Failed to auto-send invoice for ${booking._id}:`, err);
                }
            }
        }
    } catch (error) {
        console.error('Error in auto-invoice scheduler:', error);
    }
};

const startScheduler = () => {
    // Run auto-cancel every minute
    setInterval(autoCancelNoShows, 60000);
    
    // Run auto-invoice every 5 minutes
    setInterval(autoSendInvoices, 300000);
    
    console.log('Schedulers started: Auto-cancel (1m), Auto-invoice (5m)');
};

module.exports = { startScheduler };
