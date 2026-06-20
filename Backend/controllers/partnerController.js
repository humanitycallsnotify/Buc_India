import Partner from "../models/Partner.js";
import { cloudinary } from "../middleware/cloudinaryConfig.js";

export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ order: 1, createdAt: -1 });
    res.json(partners);
  } catch (error) {
    console.error("Get partners error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createPartner = async (req, res) => {
  try {
    let imageUrl = "";
    let publicId = "";
    let name = req.body.name || "Partner";

    if (req.file) {
      imageUrl = req.file.path;
      publicId = req.file.filename;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    const partner = await Partner.create({
      name,
      imageUrl,
      publicId,
    });

    res.status(201).json(partner);
  } catch (error) {
    console.error("Create partner error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    if (partner.publicId) {
      await cloudinary.uploader.destroy(partner.publicId);
    }

    await partner.deleteOne();
    res.json({ message: "Partner removed" });
  } catch (error) {
    console.error("Delete partner error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
