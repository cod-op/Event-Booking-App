const express = require("express");
const router = express.Router();
const { auth, admin } = require("../middlewares/auth");
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', auth, admin, createEvent);
router.put('/:id', auth, admin, updateEvent);
router.delete('/:id', auth, admin, deleteEvent);

module.exports = router;