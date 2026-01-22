const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  meetingPoint: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  banner: {
    type: String,
    required: true
  },
  bannerPublicId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
