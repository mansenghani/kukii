const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const logEmail = (message) => {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    try {
        fs.appendFileSync(path.join(__dirname, 'mail.log'), logMessage);
    } catch (err) {
        console.error('Logging failed:', err);
    }
};

/**
 * Basic transport function
 */
const sendEmail = async (options) => {
    logEmail(`Attempting to send email to ${options.email} - Subject: ${options.subject}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"KUKI Restaurant" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logEmail(`✅ Success: Email sent to ${options.email}. MessageID: ${info.messageId}`);
        return info;
    } catch (error) {
        logEmail(`❌ Error: Failed to send to ${options.email}. Reason: ${error.message}`);
        console.error('Nodemailer Error:', error);
    }
};

/**
 * Send automated booking emails to USER (Approved/Rejected)
 */
const sendUserBookingEmail = async (booking, status) => {
    const customerName = booking.customerId?.name || 'Valued Guest';
    const customerEmail = booking.customerId?.email;

    if (!customerEmail) {
        console.warn(`Cannot send email, no email found for customer ${customerName}`);
        return;
    }

    const isApproved = status === 'Confirmed' || status === 'approved';
    const subject = isApproved ? 'Your Reservation is Confirmed – KUKI Restaurant' : 'Reservation Update – KUKI Restaurant';

    const dateStr = new Date(booking.date).toDateString();
    const guestsCount = booking.guests;
    const bookingType = booking.type || 'Table Reservation';

    // Build Pre-Order Items HTML
    let preOrderHtml = '';
    if (isApproved && booking.preOrderId && booking.preOrderId.items && booking.preOrderId.items.length > 0) {
        let itemsRows = booking.preOrderId.items.map(item => `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e3dbd4; font-size: 14px; color: #2b2b2b;">${item.name}</td>
                <td align="center" style="padding: 10px 0; border-bottom: 1px solid #e3dbd4; font-size: 14px; color: #2b2b2b;">${item.quantity}</td>
                <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e3dbd4; font-size: 14px; font-weight: bold; color: #c67c7c;">₹${item.price}</td>
            </tr>
        `).join('');

        preOrderHtml = `
            <div style="margin-top: 25px; padding: 20px; border: 1px solid #e3dbd4; border-radius: 12px;">
                <h3 style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 14px; color: #2b2b2b; text-transform: uppercase;">Pre-Ordered Dishes</h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${itemsRows}
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding-top: 15px; font-weight: bold; color: #2b2b2b;">Grand Total</td>
                            <td align="right" style="padding-top: 15px; font-size: 16px; font-weight: bold; color: #c67c7c;">₹${booking.preOrderId.grandTotal}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #f4efec; font-family: Arial, Helvetica, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style="padding: 30px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="padding: 30px 0;">
                                <h1 style="margin: 0; font-size: 28px; color: #2b2b2b; letter-spacing: 5px; text-transform: uppercase; font-weight: 400;">KUKI</h1>
                                <p style="margin: 5px 0 0; font-size: 8px; color: #c67c7c; letter-spacing: 3px; text-transform: uppercase;">Fine Dining Redefined</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="background-color: ${isApproved ? '#c67c7c' : '#2b2b2b'}; color: #ffffff; padding: 15px; font-size: 16px; letter-spacing: 2px; text-transform: uppercase;">
                                ${isApproved ? 'Reservation Confirmed' : 'Reservation Update'}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px;">
                                <h3 style="margin: 0 0 10px; font-size: 18px; color: #2b2b2b;">Hello ${customerName},</h3>
                                <p style="margin: 0 0 20px; font-size: 15px; color: #555555; line-height: 1.5;">
                                    ${isApproved ?
            'It is our pleasure to confirm your upcoming reservation at KUKI. We look forward to serving you an unforgettable meal.' :
            'We regret to inform you that your reservation request could not be accommodated at this time.'}
                                </p>

                                ${isApproved ? `
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fcfbf9; border-radius: 10px; border: 1px solid #efefef;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td width="50%" style="padding-bottom: 15px;">
                                                        <p style="margin: 0; font-size: 8px; color: #c67c7c; text-transform: uppercase;">Date</p>
                                                        <p style="margin: 2px 0 0; font-size: 14px; color: #111111;">${dateStr}</p>
                                                    </td>
                                                    <td width="50%" style="padding-bottom: 15px;">
                                                        <p style="margin: 0; font-size: 8px; color: #c67c7c; text-transform: uppercase;">Time</p>
                                                        <p style="margin: 2px 0 0; font-size: 14px; color: #111111;">${booking.time}</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="50%">
                                                        <p style="margin: 0; font-size: 8px; color: #c67c7c; text-transform: uppercase;">Guests</p>
                                                        <p style="margin: 2px 0 0; font-size: 14px; color: #111111;">${guestsCount}</p>
                                                    </td>
                                                    <td width="50%">
                                                        <p style="margin: 0; font-size: 8px; color: #c67c7c; text-transform: uppercase;">Type</p>
                                                        <p style="margin: 2px 0 0; font-size: 14px; color: #111111;">${bookingType}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                ${preOrderHtml}
                                ` : ''}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px; background-color: #F4EFEC; text-align: center;">
                                <p style="margin: 0; font-size: 10px; color: #2b2b2b; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">KUKI FINE DINING</p>
                                <p style="margin: 10px 0 0; font-size: 9px; color: #717171;">&copy; 2026 KUKI Restaurant. All rights Reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    return sendEmail({
        email: customerEmail,
        subject,
        message: isApproved ? `Confirmed for ${dateStr} at ${booking.time}` : `Update regarding your booking`,
        html: htmlTemplate
    });
};

/**
 * Send notification email to ADMIN
 */
const sendAdminNotificationEmail = async (booking) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kukirestaurant.com';
    const customerName = booking.customerId?.name || 'Guest';
    const customerEmail = booking.customerId?.email || 'N/A';
    const status = booking.status;

    const subject = `Booking Update: ${customerName} - ${status}`;

    let preorderSummary = 'None';
    if (booking.preOrderId && booking.preOrderId.items && booking.preOrderId.items.length > 0) {
        preorderSummary = booking.preOrderId.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
        preorderSummary += ` - Total: ₹${booking.preOrderId.grandTotal}`;
    }

    const htmlTemplate = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2b2b2b; border-bottom: 2px solid #c67c7c; padding-bottom: 10px;">Booking Status Updated</h2>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>New Status:</strong> <span style="color: ${status === 'Confirmed' ? 'green' : 'red'}; font-weight: bold;">${status}</span></p>
        <p><strong>Date/Time:</strong> ${new Date(booking.date).toDateString()} at ${booking.time}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Preorder:</strong> ${preorderSummary}</p>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">Updated at: ${new Date().toLocaleString()}</p>
    </div>
    `;

    return sendEmail({
        email: adminEmail,
        subject,
        message: `Booking ${booking._id} updated to ${status}`,
        html: htmlTemplate
    });
};

module.exports = sendEmail;
module.exports.sendUserBookingEmail = sendUserBookingEmail;
module.exports.sendAdminNotificationEmail = sendAdminNotificationEmail;
