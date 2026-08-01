import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoPublicId: {
      type: String,
      default: '',
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    influencerName: {
      type: String,
      default: '',
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ['all', 'rides', 'events', 'bikes', 'rallies', 'highlights', 'cover', 'influencer_videos'],
      default: 'all',
    },
  },
  { timestamps: true }
);

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
export default GalleryItem;
