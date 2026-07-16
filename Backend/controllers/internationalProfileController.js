import InternationalProfile from "../models/InternationalProfile.js";
import { cloudinary } from "../middleware/cloudinaryConfig.js";

const parseBool = (value) => value === true || value === "true";

const buildPayload = (body, files, existing = null) => {
  const payload = {
    fullName: body.fullName?.trim() || existing?.fullName || "",
    designation: body.designation?.trim() ?? existing?.designation ?? "",
    country: body.country?.trim() ?? existing?.country ?? "",
    shortBio: body.shortBio?.trim() ?? existing?.shortBio ?? "",
    fullArticle: body.fullArticle ?? existing?.fullArticle ?? "",
    instagramUrl: body.instagramUrl?.trim() ?? existing?.instagramUrl ?? "",
    facebookUrl: body.facebookUrl?.trim() ?? existing?.facebookUrl ?? "",
    twitterUrl: body.twitterUrl?.trim() ?? existing?.twitterUrl ?? "",
    websiteUrl: body.websiteUrl?.trim() ?? existing?.websiteUrl ?? "",
    linkedInUrl: body.linkedInUrl?.trim() ?? existing?.linkedInUrl ?? "",
    displayOrder: Number(body.displayOrder ?? existing?.displayOrder ?? 0),
    isActive:
      body.isActive !== undefined
        ? parseBool(body.isActive)
        : (existing?.isActive ?? true),
  };

  let visited = [];
  if (body.visitedCountries) {
    if (Array.isArray(body.visitedCountries)) {
      visited = body.visitedCountries;
    } else if (typeof body.visitedCountries === "string") {
      visited = body.visitedCountries.split(",").map(c => c.trim()).filter(Boolean);
    }
  } else if (existing) {
    visited = existing.visitedCountries || [];
  }
  payload.visitedCountries = visited;

  const photoFile = files?.profilePhoto?.[0];
  if (photoFile) {
    payload.profilePhoto = photoFile.path;
    payload.profilePhotoPublicId = photoFile.filename;
  }

  const videoFile = files?.profileVideo?.[0];
  if (videoFile) {
    payload.profileVideo = videoFile.path;
    payload.profileVideoPublicId = videoFile.filename;
  }

  return payload;
};

const destroyAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error(`Error deleting ${resourceType} from Cloudinary:`, err);
  }
};

export const getPublicProfiles = async (req, res) => {
  try {
    const profiles = await InternationalProfile.find({ isActive: true }).sort({
      displayOrder: 1,
      createdAt: -1,
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await InternationalProfile.find().sort({
      displayOrder: 1,
      createdAt: -1,
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProfile = async (req, res) => {
  try {
    if (!req.body.fullName?.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }
    const photoFile = req.files && req.files.profilePhoto ? req.files.profilePhoto[0] : null;
    if (!photoFile) {
      return res.status(400).json({ message: "Profile photo is required" });
    }

    const profile = new InternationalProfile(buildPayload(req.body, req.files));
    const saved = await profile.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await InternationalProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const updates = buildPayload(req.body, req.files, profile);

    const photoFile = req.files && req.files.profilePhoto ? req.files.profilePhoto[0] : null;
    if (photoFile) {
      await destroyAsset(profile.profilePhotoPublicId, "image");
    }

    const videoFile = req.files && req.files.profileVideo ? req.files.profileVideo[0] : null;
    if (videoFile) {
      await destroyAsset(profile.profileVideoPublicId, "video");
    }

    Object.assign(profile, updates);
    const saved = await profile.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const profile = await InternationalProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    await destroyAsset(profile.profilePhotoPublicId, "image");
    await destroyAsset(profile.profileVideoPublicId, "video");
    await InternationalProfile.findByIdAndDelete(req.params.id);
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
