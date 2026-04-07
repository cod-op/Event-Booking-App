const Event = require('../models/Event');

const getAllEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.search) {
            const safeSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
            filters.title = { $regex: safeSearch, $options: 'i' };
        }
        const events = await Event.find(filters)
         .populate('createdBy', 'name email');
          res.json(events);
    } catch (error) {
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({
             success:false,
             message: 'Event not found' 
            });
        res.json(event);
    } catch (error) {
        res.status(500).json({
             message: 'Server Error',
            error: error.message
             });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;
        if (!title || !description || !date || !location || !category || !totalSeats) {
         return res.status(400).json({
             message: "All fields required"
             });
           }
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            imageUrl: image || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
      } catch (error) {
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message
            });
    }
};

const updateEvent = async (req, res) => {
    try {
     const allowedFields = [
      "title",
      "description",
      "date",
      "location",
      "category",
      "totalSeats",
      "ticketPrice",
      "imageUrl"
    ];

    const updates = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
        const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!event) return res.status(404).json({
             message: 'Event not found' 
            });
          res.json(event);
      } catch (error) {
        res.status(500).json({
             message: 'Server Error',
             error: error.message 
            });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ 
            message: 'Event not found'
           });
        res.json({
             message: 'Event deleted successfully'
             });
    } catch (error) {
        res.status(500).json({

             message: 'Server Error', 
             error: error.message 
            });
    }
};

module.exports={getAllEvents,getEventById,createEvent,updateEvent,deleteEvent}