const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ✅ Booking Email
const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const msg = {
            to: userEmail,
            from: process.env.EMAIL_FROM, // verified sender
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
                <h2>Hi ${userName}!</h2>
                <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
                <p>Thank you for choosing Eventora.</p>
            `
        };

        await sgMail.send(msg);
        console.log(`Booking email sent to ${userEmail}`);
    } catch (error) {
        console.error(' Booking Email Error:', error.response?.body || error);
        throw new Error("Booking email failed");
    }
};

// ✅ OTP Email
const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account_verification'
            ? 'Verify your Eventora Account'
            : 'Eventora Booking Verification';

        const msgText = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Eventora account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        const msg = {
            to: userEmail,
            from: process.env.EMAIL_FROM, // verified sender
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msgText}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">
                        This code expires in 5 minutes. If you didn't request this, please ignore this email.
                    </p>
                </div>
            `
        };

        await sgMail.send(msg);
        console.log(`✅ OTP sent to ${userEmail}`);
    } catch (error) {
        console.error(' OTP Email Error:', error.response?.body || error);
        throw new Error("Email service failed");
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };