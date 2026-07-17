import mongoose from "mongoose";

const internationalProfileSchema = new mongoose.Schema(
  {
    profilePhoto: { type: String, default: "" },
    profilePhotoPublicId: { type: String, default: "" },
    profileVideo: { type: String, default: "" },
    profileVideoPublicId: { type: String, default: "" },
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    visitedCountries: { type: [String], default: [] },
    shortBio: { type: String, default: "", trim: true },
    fullArticle: { type: String, default: "" },
    instagramUrl: { type: String, default: "", trim: true },
    facebookUrl: { type: String, default: "", trim: true },
    twitterUrl: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    linkedInUrl: { type: String, default: "", trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const InternationalProfile = mongoose.model(
  "InternationalProfile",
  internationalProfileSchema,
);
export default InternationalProfile;
