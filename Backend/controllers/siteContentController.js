import SiteContent from "../models/SiteContent.js";

const HUMANITY_CALLS_CAROUSEL_KEY = "humanity_calls_carousel";

const DEFAULT_CAROUSEL_IMAGES = [
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200/v1767814232/hc_landing_page_xrcmny.png",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200/v1767814233/humanity_how_can_i_help_xezom5.avif",
  "https://res.cloudinary.com/daokrum7i/image/upload/f_auto,q_auto,w_1200/v1767814232/hc_blood_donation_mfwveo.png",
];

export const getHumanityCallsCarousel = async (req, res) => {
  try {
    const content = await SiteContent.findOne({ key: HUMANITY_CALLS_CAROUSEL_KEY });
    const images = Array.isArray(content?.value?.images) && content.value.images.length
      ? content.value.images
      : DEFAULT_CAROUSEL_IMAGES;
    return res.json({ key: HUMANITY_CALLS_CAROUSEL_KEY, images });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch carousel content" });
  }
};

export const updateHumanityCallsCarousel = async (req, res) => {
  try {
    const incomingImages = Array.isArray(req.body?.images) ? req.body.images : [];
    const images = incomingImages.map((url) => String(url || "").trim()).filter(Boolean);

    if (!images.length) {
      return res.status(400).json({ message: "At least one image URL is required" });
    }

    const updated = await SiteContent.findOneAndUpdate(
      { key: HUMANITY_CALLS_CAROUSEL_KEY },
      { key: HUMANITY_CALLS_CAROUSEL_KEY, value: { images } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return res.json({ key: updated.key, images: updated.value.images });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update carousel content" });
  }
};
