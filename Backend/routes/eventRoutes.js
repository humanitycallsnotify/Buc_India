const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/cloudinaryConfig');

router.get('/', getEvents);
router.post('/', protect, upload.single('banner'), createEvent);
router.put('/:id', protect, upload.single('banner'), updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
