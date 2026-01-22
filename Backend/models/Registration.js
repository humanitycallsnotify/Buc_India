const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Event',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  emergencyContactName: {
    type: String,
    required: true
  },
  emergencyContactPhone: {
    type: String,
    required: true
  },
  bikeModel: {
    type: String,
    required: true
  },
  bikeRegistrationNumber: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  anyMedicalCondition: {
    type: String,
    required: true
  },
  tShirtSize: {
    type: String
  },
  licenseImage: {
    type: String,
    required: true
  },
  licenseImagePublicId: {
    type: String,
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Event-scoped uniqueness indexes
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, phone: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, bikeRegistrationNumber: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, licenseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
