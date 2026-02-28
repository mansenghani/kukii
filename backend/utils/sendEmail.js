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
 * Handles both Booking (tables) and Event schemas
 */
const sendUserBookingEmail = async (data, status) => {
    // Detect type: Booking has customerId, Event has email directly
    const isEvent = !!data.eventDate;

    const customerName = isEvent ? data.name : (data.customerId?.name || 'Valued Guest');
    const customerEmail = isEvent ? data.email : data.customerId?.email;

    if (!customerEmail) {
        console.warn(`Cannot send email, no email found for ${customerName}`);
        return;
    }

    const isApproved = status === 'approved';
    const typeLabel = isEvent ? 'Private Event' : 'Table Reservation';
    const subject = isApproved ? `Your ${typeLabel} is Confirmed – KUKI Restaurant` : `Reservation Update – KUKI Restaurant`;

    const rawDate = isEvent ? data.eventDate : data.date;
    const dateStr = new Date(rawDate).toDateString();

    const timeStr = isEvent ? data.timeSlot : data.time;
    const guestsCount = data.guests;

    // Build Pre-Order Items HTML
    let preOrderHtml = '';
    const preOrder = data.preOrderId;
    if (isApproved && preOrder && preOrder.items && preOrder.items.length > 0) {
        let itemsRows = preOrder.items.map(item => `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e3dbd4; font-size: 14px; color: #2b2b2b;">${item.name}</td>
                <td align="center" style="padding: 10px 0; border-bottom: 1px solid #e3dbd4; font-size: 14px; color: #2b2b2b;">${item.quantity}</td>
                <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e3dbd4; font-size: 14px; font-weight: bold; color: #c67c7c;">₹${item.total || item.price}</td>
            </tr>
        `).join('');

        preOrderHtml = `
            <div style="margin-top: 25px; padding: 20px; border: 1px solid #e3dbd4; border-radius: 0;">
                <h3 style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 14px; color: #2b2b2b; text-transform: uppercase;">Pre-Ordered Catering</h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${itemsRows}
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding-top: 15px; font-weight: bold; color: #2b2b2b;">Grand Total</td>
                            <td align="right" style="padding-top: 15px; font-size: 16px; font-weight: bold; color: #c67c7c;">₹${preOrder.grandTotal}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #fcfbf9; font-family: Arial, Helvetica, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style="padding: 30px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #efefef;">
                        <tr>
                            <td align="center" style="padding: 40px 0 20px;">
                                <h1 style="margin: 0; font-size: 32px; color: #2b2b2b; letter-spacing: 8px; text-transform: uppercase; font-weight: 400;">KUKI</h1>
                                <p style="margin: 5px 0 0; font-size: 9px; color: #c67c7c; letter-spacing: 4px; text-transform: uppercase;">Fine Dining Redefined</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="background-color: ${isApproved ? '#c67c7c' : '#2b2b2b'}; color: #ffffff; padding: 18px; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; font-weight: bold;">
                                ${isApproved ? 'Reservation Confirmed' : 'Reservation Update'}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 50px 40px;">
                                <h3 style="margin: 0 0 15px; font-size: 20px; color: #2b2b2b; font-weight: bold;">Hello ${customerName},</h3>
                                <p style="margin: 0 0 30px; font-size: 15px; color: #555555; line-height: 1.6;">
                                    ${isApproved ?
            'It is our pleasure to confirm your upcoming reservation at KUKI. We look forward to serving you an unforgettable meal.' :
            'We regret to inform you that your reservation request could not be accommodated at this time.'}
                                </p>

                                ${isApproved ? `
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fcfbf9; border-radius: 0; border: 1px solid #efefef;">
                                    <tr>
                                        <td style="padding: 25px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td width="50%" style="padding-bottom: 20px;">
                                                        <p style="margin: 0; font-size: 9px; color: #c67c7c; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Date</p>
                                                        <p style="margin: 4px 0 0; font-size: 15px; color: #111111; font-weight: bold;">${dateStr}</p>
                                                    </td>
                                                    <td width="50%" style="padding-bottom: 20px;">
                                                        <p style="margin: 0; font-size: 9px; color: #c67c7c; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Time</p>
                                                        <p style="margin: 4px 0 0; font-size: 15px; color: #111111; font-weight: bold;">${timeStr}</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td width="50%">
                                                        <p style="margin: 0; font-size: 9px; color: #c67c7c; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Guests</p>
                                                        <p style="margin: 4px 0 0; font-size: 15px; color: #111111; font-weight: bold;">${guestsCount} pax</p>
                                                    </td>
                                                    <td width="50%">
                                                        <p style="margin: 0; font-size: 9px; color: #c67c7c; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Type</p>
                                                        <p style="margin: 4px 0 0; font-size: 15px; color: #111111; font-weight: bold;">${typeLabel}</p>
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
                            <td style="padding: 40px; background-color: #ffffff; border-top: 1px solid #efefef; text-align: center;">
                                <div style="display: block; width: 100%; text-align: center;">
                                    <p style="margin: 0; font-size: 11px; color: #2b2b2b; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">KUKI FINE DINING</p>
                                    <p style="margin: 12px 0 0; font-size: 10px; color: #717171; line-height: 1.5;">
                                        &copy; 2026 KUKI Restaurant. All rights Reserved.<br>
                                        Exquisite Dining Experiences Redefined.
                                    </p>
                                </div>
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
        message: isApproved ? `Confirmed for ${dateStr} at ${timeStr}` : `Update regarding your booking`,
        html: htmlTemplate
    });
};

/**
 * Send notification email to ADMIN
 */
const sendAdminNotificationEmail = async (data) => {
    const adminEmail = 'noreply.ecart27@gmail.com';
    const isEvent = !!data.eventDate;

    const customerName = isEvent ? data.name : (data.customerId?.name || 'Guest');
    const customerEmail = isEvent ? data.email : (data.customerId?.email || 'N/A');
    const status = data.status;
    const typeLabel = isEvent ? 'Private Event' : 'Table Reservation';

    const subject = `Booking Update: ${customerName} - ${status} (${typeLabel})`;

    let preorderSummary = 'None';
    if (data.preOrderId && data.preOrderId.items && data.preOrderId.items.length > 0) {
        preorderSummary = data.preOrderId.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
        preorderSummary += ` - Total: ₹${data.preOrderId.grandTotal}`;
    }

    const htmlTemplate = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 0;">
        <h2 style="color: #2b2b2b; border-bottom: 2px solid #c67c7c; padding-bottom: 10px;">${typeLabel} Status Updated</h2>
        <p><strong>Booking ID:</strong> ${data._id}</p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>New Status:</strong> <span style="color: ${status === 'approved' ? 'green' : 'red'}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
        <p><strong>Date/Time:</strong> ${new Date(isEvent ? data.eventDate : data.date).toDateString()} at ${isEvent ? data.timeSlot : data.time}</p>
        <p><strong>Guests:</strong> ${data.guests}</p>
        <p><strong>Preorder:</strong> ${preorderSummary}</p>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">Updated at: ${new Date().toLocaleString()}</p>
    </div>
    `;

    return sendEmail({
        email: adminEmail,
        subject,
        message: `Booking ${data._id} updated to ${status}`,
        html: htmlTemplate
    });
};

module.exports = sendEmail;
module.exports.sendUserBookingEmail = sendUserBookingEmail;
module.exports.sendAdminNotificationEmail = sendAdminNotificationEmail;
