const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testEmail() {
    console.log('--- Verbose Email Test ---');
    console.log('Using User:', process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        debug: true, // show debug output
        logger: true // log to console
    });

    try {
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'SMTP Diagnostic',
            text: 'Diagnostic content'
        });
        console.log('✅ Sent:', info.messageId);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error Details:', err);
        process.exit(1);
    }
}

testEmail();
