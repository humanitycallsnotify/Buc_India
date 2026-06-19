import GalleryItem from '../models/GalleryItem.js';
import { cloudinary } from '../middleware/cloudinaryConfig.js';

export const getGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    const { eventName, eventDate, category, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required' });
    }

    if (!eventName || !eventDate) {
      return res.status(400).json({ message: 'Event name and date are required' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');

    const item = new GalleryItem({
      eventName,
      eventDate,
      category: category || (isVideo ? 'highlights' : 'all'),
      imageUrl: isVideo ? '' : req.file.path,
      imagePublicId: isVideo ? '' : req.file.filename,
      videoUrl: isVideo ? req.file.path : '',
      videoPublicId: isVideo ? req.file.filename : '',
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (err) {
        console.error('Error deleting gallery image from Cloudinary:', err);
      }
    }

    await GalleryItem.findByIdAndDelete(id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, eventDate, category } = req.body;
    
    const item = await GalleryItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    item.eventName = eventName || item.eventName;
    item.eventDate = eventDate || item.eventDate;
    item.category = category || item.category;

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');

      if (isVideo) {
        item.videoUrl = req.file.path;
        item.videoPublicId = req.file.filename;
        item.imageUrl = '';
        item.imagePublicId = '';
      } else {
        item.imageUrl = req.file.path;
        item.imagePublicId = req.file.filename;
        item.videoUrl = '';
        item.videoPublicId = '';
      }
    }

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
