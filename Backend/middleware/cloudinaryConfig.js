import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for event banners and license images
const eventStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'buc_india_events',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 600, crop: 'limit' }]
  }
});

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'buc_india_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Storage for gallery images
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'buc_india_gallery',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1400, height: 900, crop: 'limit' }]
  }
});

// Storage for club collaboration assets (logos, documents, photos)
const clubStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'buc_india_clubs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

// Storage for talent visual assets (logos, documents, photos, videos)
const talentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'buc_india_talents',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo 
        ? ['mp4', 'mov', 'avi', 'mkv', 'webm'] 
        : ['jpg', 'png', 'jpeg', 'webp'],
    };
  }
});

export const upload = multer({ storage: eventStorage });
export const profileUpload = multer({ storage: profileStorage });
export const galleryUpload = multer({ storage: galleryStorage });
export const clubUpload = multer({ storage: clubStorage });
export const talentUpload = multer({ storage: talentStorage });
export { cloudinary };
