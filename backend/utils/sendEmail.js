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
        if (error.code === 'EAUTH') {
            logEmail(`   Security Warning: Gmail Authentication failed. Check App Password.`);
        }
    }
};

module.exports = sendEmail;
