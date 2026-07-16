import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Event',
    required: true
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
    default: "",
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    default: "",
  },
  fullName: {
    type: String,
    required: false,
    trim: true,
    default: "",
  },
  designation: {
    type: String,
    trim: true,
    default: "",
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: "",
  },
  phone: {
    type: String,
    required: false,
    default: "",
  },
  registrationType: {
    type: String,
    enum: ['student', 'student_rider', 'rider', 'pillion', 'public', 'international_rider', ''],
    default: ''
  },
  clubName: {
    type: String,
    trim: true,
    default: ''
  },
  clubNameCustom: {
    type: String,
    trim: true,
    default: ''
  },
  collegeName: {
    type: String,
    trim: true,
    default: ''
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  year: {
    type: String,
    trim: true,
    default: ''
  },
  ridingExperience: {
    type: String,
    trim: true,
    default: ''
  },
  interestReason: {
    type: String,
    trim: true,
    default: ''
  },
  facebookUrl: { type: String, trim: true, default: '' },
  instagramUrl: { type: String, trim: true, default: '' },
  twitterUrl: { type: String, trim: true, default: '' },
  youtubeUrl: { type: String, trim: true, default: '' },
  websiteUrl: { type: String, trim: true, default: '' },
  acceptedTerms: { type: Boolean, default: false },
  dateOfBirth: {
    type: Date
  },
  bloodGroup: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: String
  },
  emergencyContactName: {
    type: String
  },
  emergencyContactPhone: {
    type: String
  },
  bikeModel: {
    type: String
  },
  bikeRegistrationNumber: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  anyMedicalCondition: {
    type: String
  },
  tShirtSize: {
    type: String
  },
  hasLinkedPillion: {
    type: Boolean,
    default: false
  },
  linkedPillion: {
    name: { type: String, trim: true, default: "" },
    mobile: { type: String, trim: true, default: "" },
    tShirtSize: { type: String, trim: true, default: "" }
  },
  riderReference: {
    riderRegistrationId: { type: String, trim: true, default: "" },
    riderPhone: { type: String, trim: true, default: "" },
    riderName: { type: String, trim: true, default: "" }
  },
  licenseImage: {
    type: String,
    default: ''
  },
  licenseImagePublicId: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  profileImagePublicId: {
    type: String,
    default: ''
  },
  profileVideo: {
    type: String,
    default: ''
  },
  visitedCountries: [{
    type: String,
    trim: true
  }],
  requestRidingGears: {
    type: Boolean,
    default: false
  },
  requestedGears: {
    helmet: { type: Boolean, default: false },
    gloves: { type: Boolean, default: false },
    jacket: { type: Boolean, default: false },
    boots: { type: Boolean, default: false },
    kneeGuards: { type: Boolean, default: false },
    elbowGuards: { type: Boolean, default: false }
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  gender: { type: String, trim: true, default: '' },
  bikeBrand: { type: String, trim: true, default: '' },
  aadhaarNumber: { type: String, trim: true, default: '' },
  allergies: { type: String, trim: true, default: '' },
  insurance: { type: String, trim: true, default: '' },
  registrationStatus: { 
    type: String, 
    enum: ['draft', 'confirmed', 'cancelled'],
    default: 'confirmed' 
  },
  customAnswers: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

// Event-scoped uniqueness indexes (sparse — only index when field is present)
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true, sparse: true });
registrationSchema.index({ eventId: 1, phone: 1 }, { unique: true, sparse: true });
registrationSchema.index(
  { eventId: 1, bikeRegistrationNumber: 1 },
  { unique: true, sparse: true }
);
registrationSchema.index(
  { eventId: 1, licenseNumber: 1 },
  { unique: true, sparse: true }
);

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
