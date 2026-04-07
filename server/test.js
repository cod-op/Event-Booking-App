// test.js
require('dotenv').config();
const nodemailer = require('nodemailer');

// 1️⃣ Setup transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // your 16-char App Password
    },
});

// 2️⃣ OTP email sender function
const sendTestOTP = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"Eventora Support" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Test OTP from Eventora',
            html: `
                <h2>Hi!</h2>
                <p>This is a test OTP from Eventora.</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">${otp}</div>
                <p>If you didn’t request this, ignore this email.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
    }
};

// 3️⃣ Run a test
const test = async () => {
    const testEmail = 'patelshlok841@gmail.com'; // your email
    const otp = Math.floor(100000 + Math.random() * 900000); // random 6-digit OTP
    await sendTestOTP(testEmail, otp);
};

test();