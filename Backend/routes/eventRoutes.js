import express from 'express';
import { getEvents, getHomepageEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { getPublicEvent } from '../controllers/ogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/cloudinaryConfig.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/homepage', getHomepageEvents);
router.get('/public/:identifier', getPublicEvent);
router.post('/', protect, upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'gallery', maxCount: 20 }]), createEvent);
router.put('/:id', protect, upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'gallery', maxCount: 20 }]), updateEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
