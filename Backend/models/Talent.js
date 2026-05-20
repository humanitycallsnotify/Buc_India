import mongoose from "mongoose";

const talentSchema = new mongoose.Schema(
  {
    // Basic Details
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other", "Prefer not to say"] },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },

    // Talent Details
    talentCategory: { type: String, required: true, trim: true },
    subTalentDescription: { type: String, required: true, trim: true },
    experienceLevel: { 
      type: String, 
      required: true, 
      enum: ["Beginner", "Intermediate", "Professional"] 
    },
    yearsOfExperience: { type: Number, required: true },

    // Proof of Talent
    portfolioLink: { type: String, trim: true },

    // Biker Info (Optional)
    isRider: { type: Boolean, default: false },
    bikeModel: { type: String, trim: true },
    ridingExperience: { type: String, trim: true },

    // Additional Info
    shortDescription: { type: String, required: true, trim: true },
    whyParticipate: { type: String, required: true, trim: true },

    // Availability
    availableDates: { type: String, required: true, trim: true },

    // Pro Filter Fields
    openToPerformLive: { type: Boolean, default: false },
    openToCompetition: { type: Boolean, default: false },

    // Optional
    pastAchievements: { type: String, trim: true },
    socialMediaLinks: { type: String, trim: true },

    // Legal consents
    consentInfoTrue: { type: Boolean, required: true },
    consentRules: { type: Boolean, required: true },
    consentMedia: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Talent = mongoose.model("Talent", talentSchema);

export default Talent;
