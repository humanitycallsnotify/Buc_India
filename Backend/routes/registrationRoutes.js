const express = require('express');
const router = express.Router();
const { createRegistration, getRegistrations, deleteRegistration } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/cloudinaryConfig');

router.post('/', upload.fields([{ name: 'licenseImage', maxCount: 1 }]), createRegistration);
router.get('/', protect, getRegistrations);
router.delete('/:id', protect, deleteRegistration);

module.exports = router;
