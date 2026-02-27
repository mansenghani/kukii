const sendEmail = require('./sendEmail');

/**
 * Send automated booking emails (Approved/Rejected)
 * @param {Object} booking - The populated booking document
 * @param {String} status - The new status ('Confirmed' or 'Cancelled')
 */
const sendBookingEmail = async (booking, status) => {
    const customerName = booking.customerId?.name || 'Valued Guest';
    const customerEmail = booking.customerId?.email;

    if (!customerEmail) {
        console.warn(`Cannot send email, no email found for customer ${customerName}`);
        return;
    }

    const isApproved = status === 'Confirmed';
    const subject = isApproved ? 'Booking Confirmed – KUKI Restaurant' : 'Booking Update – KUKI Restaurant';

    let messageBody = `Hello ${customerName},\n\n`;

    if (isApproved) {
        messageBody += `Your booking has been confirmed.\n\n`;
        messageBody += `Booking Details:\n`;
        messageBody += `Date: ${new Date(booking.date).toDateString()}\n`;
        messageBody += `Time: ${booking.time}\n`;
        messageBody += `Guests: ${booking.guests}\n`;
        messageBody += `Type: ${booking.type || 'Table Reservation'}\n\n`;

        // Include Pre-Order Items if they exist
        if (booking.preOrderId) {
            const preOrderStatus = booking.preOrderId.status ? booking.preOrderId.status.charAt(0).toUpperCase() + booking.preOrderId.status.slice(1) : 'Pending';
            messageBody += `Pre-Order Status: ${preOrderStatus}\n`;

            if (booking.preOrderId.items && booking.preOrderId.items.length > 0) {
                messageBody += `Pre-Ordered Items:\n`;
                booking.preOrderId.items.forEach(item => {
                    messageBody += `- ${item.name} × ${item.quantity} (₹${item.price})\n`;
                });
                messageBody += `\nTotal Preorder Amount: ₹${booking.preOrderId.grandTotal}\n\n`;
            } else {
                messageBody += `\n`;
            }
        }

        messageBody += `Thank you for choosing KUKI Restaurant.`;
    } else {
        messageBody += `Unfortunately, your booking could not be confirmed.\n\n`;
        messageBody += `Please contact us for further assistance.\n\n`;
        messageBody += `Regards,\nKUKI Restaurant`;
    }

    try {
        await sendEmail({
            email: customerEmail,
            subject,
            message: messageBody
        });
    } catch (error) {
        console.error('Error in sendBookingEmail utility:', error);
    }
};

module.exports = { sendBookingEmail };
