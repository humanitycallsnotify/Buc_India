import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { cloudinary } from '../middleware/cloudinaryConfig.js';
import {
  parseRegistrationFields,
  parseRegistrationSettings,
  parseCustomQuestions,
} from '../utils/eventRegistrationConfig.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 });
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          $or: [{ eventId: event._id }, { eventId: event._id.toString() }],
        });
        return {
          ...event.toObject(),
          registrationCount,
        };
      }),
    );
    res.json(eventsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHomepageEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({
      isActive: true,
      showOnHomepage: true,
      eventDate: { $gte: now },
    }).sort({ eventDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventDate,
      eventTime,
      location,
      meetingPoint,
      isActive,
      showOnHomepage,
      certificateEnabled,
      registrationFields,
      registrationSettings,
      customQuestions,
      itinerary,
    } = req.body;

    const parsedRegistrationFields = parseRegistrationFields(registrationFields);
    const parsedRegistrationSettings = parseRegistrationSettings(registrationSettings);
    const parsedCustomQuestions = parseCustomQuestions(customQuestions);
    
    let parsedItinerary = [];
    if (itinerary) {
      try {
        parsedItinerary = JSON.parse(itinerary);
      } catch (e) {
        console.error("Failed to parse itinerary JSON:", e);
      }
    }

    const bannerFile = req.files && req.files.banner && req.files.banner[0];
    if (!bannerFile) {
      return res.status(400).json({ message: 'Event banner is mandatory' });
    }

    const galleryImages = [];
    if (req.files && req.files.gallery) {
      req.files.gallery.forEach((file) => {
        galleryImages.push({
          url: file.path,
          publicId: file.filename,
        });
      });
    }

    const event = new Event({
      title,
      description,
      eventDate,
      eventTime,
      location,
      meetingPoint,
      isActive:
        typeof isActive === "string"
          ? isActive === "true"
          : isActive !== undefined
            ? !!isActive
            : true,
      showOnHomepage:
        typeof showOnHomepage === "string"
          ? showOnHomepage === "true"
          : !!showOnHomepage,
      certificateEnabled:
        typeof certificateEnabled === "string"
          ? certificateEnabled === "true"
          : !!certificateEnabled,
      banner: bannerFile.path,
      bannerPublicId: bannerFile.filename,
      itinerary: parsedItinerary,
      gallery: galleryImages,
      ...(parsedRegistrationFields ? { registrationFields: parsedRegistrationFields } : {}),
      ...(parsedRegistrationSettings ? { registrationSettings: parsedRegistrationSettings } : {}),
      ...(parsedCustomQuestions ? { customQuestions: parsedCustomQuestions } : {}),
    });

    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.isActive !== undefined) {
      updateData.isActive =
        typeof updateData.isActive === "string"
          ? updateData.isActive === "true"
          : !!updateData.isActive;
    }

    if (updateData.showOnHomepage !== undefined) {
      updateData.showOnHomepage =
        typeof updateData.showOnHomepage === "string"
          ? updateData.showOnHomepage === "true"
          : !!updateData.showOnHomepage;
    }

    if (updateData.certificateEnabled !== undefined) {
      updateData.certificateEnabled =
        typeof updateData.certificateEnabled === "string"
          ? updateData.certificateEnabled === "true"
          : !!updateData.certificateEnabled;
    }

    const bannerFile = req.files && req.files.banner && req.files.banner[0];
    if (bannerFile) {
      // Delete old image if new one is uploaded
      const oldEvent = await Event.findById(id);
      if (oldEvent && oldEvent.bannerPublicId) {
        await cloudinary.uploader.destroy(oldEvent.bannerPublicId);
      }
      updateData.banner = bannerFile.path;
      updateData.bannerPublicId = bannerFile.filename;
    }

    if (updateData.registrationFields !== undefined) {
      updateData.registrationFields = parseRegistrationFields(updateData.registrationFields);
    }
    if (updateData.registrationSettings !== undefined) {
      updateData.registrationSettings = parseRegistrationSettings(updateData.registrationSettings);
    }
    if (updateData.customQuestions !== undefined) {
      updateData.customQuestions = parseCustomQuestions(updateData.customQuestions);
    }

    if (updateData.itinerary !== undefined) {
      try {
        updateData.itinerary = JSON.parse(updateData.itinerary);
      } catch (e) {
        console.error("Failed to parse itinerary JSON:", e);
      }
    }

    // Process gallery updates
    let currentGallery = [];
    if (updateData.gallery !== undefined) {
      try {
        currentGallery = JSON.parse(updateData.gallery);
      } catch (e) {
        console.error("Failed to parse gallery JSON:", e);
      }
    }

    // Delete removed images from Cloudinary
    const oldEvent = await Event.findById(id);
    if (oldEvent && oldEvent.gallery && updateData.gallery !== undefined) {
      const remainingPublicIds = new Set(currentGallery.map((img) => img.publicId));
      for (const img of oldEvent.gallery) {
        if (img.publicId && !remainingPublicIds.has(img.publicId)) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (clErr) {
            console.error('Error deleting gallery image from Cloudinary:', clErr);
          }
        }
      }
    }

    // Add new uploaded gallery images
    if (req.files && req.files.gallery) {
      req.files.gallery.forEach((file) => {
        currentGallery.push({
          url: file.path,
          publicId: file.filename,
        });
      });
    }

    // If gallery was submitted or there were new uploads, update it
    if (updateData.gallery !== undefined || (req.files && req.files.gallery)) {
      updateData.gallery = currentGallery;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete associated registrations and their license images
    const registrations = await Registration.find({ eventId: req.params.id });
    for (const reg of registrations) {
      if (reg.licenseImagePublicId) {
        try {
          await cloudinary.uploader.destroy(reg.licenseImagePublicId);
        } catch (clErr) {
          console.error('Error deleting registration image from Cloudinary:', clErr);
        }
      }
    }
    await Registration.deleteMany({ eventId: req.params.id });

    // Delete image from cloudinary
    if (event.bannerPublicId) {
      await cloudinary.uploader.destroy(event.bannerPublicId);
    }

    // Delete gallery images from cloudinary
    if (event.gallery && event.gallery.length > 0) {
      for (const img of event.gallery) {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (clErr) {
            console.error('Error deleting gallery image from Cloudinary:', clErr);
          }
        }
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event and associated registrations deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
