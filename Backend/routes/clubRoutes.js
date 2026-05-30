import express from 'express';
import {
  getPublicClubs,
  getAllClubs,
  createClubRequest,
  updateClubStatus,
  deleteClub,
} from '../controllers/clubController.js';
import { protect } from '../middleware/authMiddleware.js';
import { clubUpload } from '../middleware/cloudinaryConfig.js';

const router = express.Router();

// Public
router.get('/public', getPublicClubs);

// Public - collaboration request (multi-part with images)
router.post(
  '/',
  clubUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'firstRideImage', maxCount: 1 },
    { name: 'governmentIdImage', maxCount: 1 },
    { name: 'founderPassport', maxCount: 1 },
  ]),
  createClubRequest
);

// Admin
router.get('/', protect, getAllClubs);
router.patch('/:id/status', protect, updateClubStatus);
router.delete('/:id', protect, deleteClub);

export default router;
