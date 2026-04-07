const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/Otp');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


// SEND OTP 
const sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();

        // remove old OTP
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });

        await OTP.create({
            email: req.user.email,
            otp,
            action: 'event_booking'
        });

        await sendOTPEmail(req.user.email, otp, 'event_booking');

        res.json({
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: error.message
        });
    }
};



const bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        if (!eventId || !otp) {
            return res.status(400).json({
                message: 'Event ID and OTP are required'
            });
        }

        // Verify OTP
        const validOTP = await OTP.findOne({
            email: req.user.email,
            otp,
            action: 'event_booking'
        });

        if (!validOTP) {
            return res.status(400).json({
                message: 'Invalid or expired OTP'
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'Event is sold out' });
        }

        // Prevent duplicate booking / reuse cancelled
        let existingBooking = await Booking.findOne({
            userId: req.user.id,
            eventId
        });

        if (existingBooking) {
            if (existingBooking.status === 'cancelled') {
                existingBooking.status = 'pending';
                existingBooking.paymentStatus = 'not_paid';
                existingBooking.amount = event.ticketPrice;

                await existingBooking.save();

                await OTP.deleteOne({ _id: validOTP._id });

                return res.json({
                    success: true,
                    message: 'Booking re-requested',
                    booking: existingBooking
                });
            }

            return res.status(400).json({
                message: 'You already have a booking for this event'
            });
        }

        // Create new booking
        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id });

        res.status(201).json({
            success: true,
            message: 'Booking request submitted',
            booking
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};


//  CONFIRM BOOKING (ADMIN) 
const confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        const booking = await Booking.findById(req.params.id)
            .populate('userId')
            .populate('eventId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({
                message: 'Booking already confirmed'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'Cannot confirm a cancelled booking'
            });
        }

        const event = await Event.findById(booking.eventId._id);

        if (!event || event.availableSeats <= 0) {
            return res.status(400).json({
                message: 'No seats available'
            });
        }

        // Confirm booking
        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus || 'not_paid';

        await booking.save();

        // Deduct seat
        event.availableSeats -= 1;
        await event.save();

        //  Send email
        await sendBookingEmail(
            booking.userId.email,
            booking.userId.name,
            booking.eventId.title
        );

        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            booking
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};


//GET BOOKINGS
const getMyBookings = async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? {}
            : { userId: req.user.id };

        const bookings = await Booking.find(query)
            .populate('eventId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};


// CANCEL BOOKING 
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (
            booking.userId.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Already cancelled' });
        }

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        //Restore seat only if confirmed
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);

            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};


module.exports = {sendBookingOTP,bookEvent,confirmBooking,getMyBookings,cancelBooking
};