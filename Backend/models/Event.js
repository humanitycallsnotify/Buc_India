import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    meetingPoint: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnHomepage: {
      type: Boolean,
      default: false,
    },
    // When enabled by admin, riders can download e-certificates
    certificateEnabled: {
      type: Boolean,
      default: false,
    },
    banner: {
      type: String,
      required: true,
    },
    bannerPublicId: {
      type: String,
      required: true,
    },
    registrationFields: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    registrationSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    customQuestions: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    itinerary: [
      {
        time: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String, required: true },
      }
    ],
    gallery: [
      {
        url: { type: String, required: true },
        publicId: { type: String }
      }
    ],
  },
  { timestamps: true },
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
