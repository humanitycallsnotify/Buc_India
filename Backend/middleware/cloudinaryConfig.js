import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_GALLERY_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const imageFileFilter = (_req, file, cb) => {
  if (IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only JPG, PNG, and WEBP images are allowed.'), false);
};

const galleryFileFilter = (_req, file, cb) => {
  if (IMAGE_MIME_TYPES.has(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Only JPG, PNG, WEBP images or common video formats are allowed.'), false);
};

const createImageUpload = (storage) =>
  multer({
    storage,
    limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES },
    fileFilter: imageFileFilter,
  });

// Storage for event banners and license images (was 1000×600)
const eventStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'buc_india_events',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 3840, height: 2160, crop: 'limit' }]
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

// Storage for gallery images and registration portal cover (was 1400×900)
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'buc_india_gallery',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 3840, height: 2160, crop: 'limit' }]
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

export const upload = createImageUpload(eventStorage);
export const profileUpload = createImageUpload(profileStorage);
export const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: MAX_GALLERY_VIDEO_BYTES },
  fileFilter: galleryFileFilter,
});
export const clubUpload = createImageUpload(clubStorage);
export const talentUpload = multer({
  storage: talentStorage,
  limits: { fileSize: MAX_GALLERY_VIDEO_BYTES },
  fileFilter: galleryFileFilter,
});
export { cloudinary };
