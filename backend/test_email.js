const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testEmail() {
    console.log('--- Email Configuration Test ---');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass:', process.env.EMAIL_PASS ? '******** (Loaded)' : 'MISSING');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Connecting to SMTP...');
        await transporter.verify();
        console.log('✅ Success: SMTP connection is valid!');

        // Attempt sending a real test email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'KUKI - SMTP Test Email',
            text: 'If you are reading this, your email configuration for KUKI is working perfectly.'
        };

        console.log('Sending test email to self...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email Sent!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.code === 'EAUTH') {
            console.log('\nSUGGESTION: Your App Password might be incorrect or 2-Step Verification is not enabled.');
        }
    }
}

testEmail();
