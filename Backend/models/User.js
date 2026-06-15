import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  bucId: {
    type: String,
    unique: true,
    sparse: true
  },
  registrationType: {
    type: String,
    enum: ['PS', 'Public User', 'Rider', 'Student Rider', 'Student', 'Pillion'],
    default: 'Rider'
  },
  tshirtSize: {
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    default: ''
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  },
  collegeName: {
    type: String,
    default: ''
  },
  collegeIdNo: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: false,
    sparse: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  fullName: {
    type: String,
    trim: true,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefernottosay', ''],
    default: ''
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    default: ''
  },
  bikeModel: {
    type: String,
    default: ''
  },
  bikeRegistrationNumber: {
    type: String,
    default: ''
  },
  licenseNumber: {
    type: String,
    default: ''
  },
  emergencyContactName: {
    type: String,
    default: ''
  },
  emergencyContactPhone: {
    type: String,
    default: ''
  },
  riderPhone: {
    type: String,
    default: ''
  },
  riderRegistrationId: {
    type: String,
    default: ''
  },
  // Social media links
  facebookUrl: {
    type: String,
    default: ''
  },
  instagramUrl: {
    type: String,
    default: ''
  },
  twitterUrl: {
    type: String,
    default: ''
  },
  youtubeUrl: {
    type: String,
    default: ''
  },
  websiteUrl: {
    type: String,
    default: ''
  },
  socialLinks: [{
    platform: { type: String, trim: true },
    url: { type: String, trim: true }
  }],
  profileImage: {
    type: String,
    default: ''
  },
  profileImagePublicId: {
    type: String,
    default: ''
  },
  licenseImage: {
    type: String,
    default: ''
  },
  licenseImagePublicId: {
    type: String,
    default: ''
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
