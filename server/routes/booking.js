const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middlewares/auth');
const { bookEvent, confirmBooking, getMyBookings, cancelBooking, sendBookingOTP } = require('../controllers/bookingController');



router.post('/send-otp', auth, sendBookingOTP);
router.post('/', auth, bookEvent);
router.put('/:id/confirm', auth, admin, confirmBooking);
router.get('/my', auth, getMyBookings);
router.delete('/:id', auth, cancelBooking);

module.exports = router;