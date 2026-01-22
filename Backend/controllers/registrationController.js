const Registration = require('../models/Registration');
const { cloudinary } = require('../middleware/cloudinaryConfig');

const createRegistration = async (req, res) => {
  console.log('Incoming Registration Request:', {
    body: req.body,
    files: req.files ? Object.keys(req.files) : 'no files'
  });
  try {
    const { 
      eventId, fullName, email, phone, dateOfBirth, bloodGroup, 
      address, city, state, pincode, 
      emergencyContactName, emergencyContactPhone,
      bikeModel, bikeRegistrationNumber, licenseNumber, 
      anyMedicalCondition,
      tShirtSize 
    } = req.body;

    if (!req.files || !req.files.licenseImage) {
      return res.status(400).json({ message: 'Driving license image is mandatory' });
    }

    // Check age (18+)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      return res.status(400).json({ message: 'You must be at least 18 years old to register' });
    }

    // Check for duplicates within the same event
    const duplicate = await Registration.findOne({
      eventId,
      $or: [
        { email },
        { phone },
        { bikeRegistrationNumber },
        { licenseNumber }
      ]
    });

    if (duplicate) {
      let field = '';
      if (duplicate.email === email) field = 'Email';
      else if (duplicate.phone === phone) field = 'Phone number';
      else if (duplicate.bikeRegistrationNumber === bikeRegistrationNumber) field = 'Bike registration number';
      else if (duplicate.licenseNumber === licenseNumber) field = 'License number';
      
      return res.status(400).json({ message: `${field} is already registered` });
    }

    const registration = new Registration({
      eventId,
      fullName,
      email,
      phone,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      bikeModel,
      bikeRegistrationNumber,
      licenseNumber,
      anyMedicalCondition,
      tShirtSize,
      licenseImage: req.files.licenseImage[0].path,
      licenseImagePublicId: req.files.licenseImage[0].filename
    });

    const newRegistration = await registration.save();
    res.status(201).json(newRegistration);
  } catch (error) {
    console.error('Registration Error:', error);
    
    // Handle Mongoose duplicate key error (E11000)
    if (error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      let field = Object.keys(keyPattern).find(k => k !== 'eventId') || Object.keys(keyPattern)[0];
      
      // Map field names to user-friendly labels
      const fieldLabels = {
        'email': 'Email',
        'phone': 'Phone number',
        'bikeRegistrationNumber': 'Bike registration number',
        'licenseNumber': 'License number'
      };

      const label = fieldLabels[field] || (field.charAt(0).toUpperCase() + field.slice(1));
      return res.status(400).json({ 
        message: `${label} is already registered for this particular event.` 
      });
    }

    res.status(400).json({ message: error.message });
  }
};

const getRegistrations = async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId && eventId !== 'all' ? { eventId } : {};
    let registrations = await Registration.find(filter)
      .populate('eventId', 'title eventDate')
      .sort({ registeredAt: -1 });

    // Filter out registrations where the event no longer exists (except for community registrations)
    registrations = registrations.filter(reg => {
      // If it's a community registration, keep it
      if (reg.eventId === 'community') return true;
      // If it's an event registration, keep it only if the populated eventId exists
      return reg.eventId !== null && reg.eventId !== undefined;
    });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Delete image from cloudinary
    if (registration.licenseImagePublicId) {
      await cloudinary.uploader.destroy(registration.licenseImagePublicId);
    }

    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  deleteRegistration
};
