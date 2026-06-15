import Talent from "../models/Talent.js";
import Otp from "../models/Otp.js";
import { generateUniqueBucId } from "../utils/generateBucId.js";
import { sendRegistrationConfirmation } from "../utils/mailSender.js";
import { cloudinary } from "../middleware/cloudinaryConfig.js";

export const submitTalent = async (req, res) => {
  try {
    const {
      fullName, age, dateOfBirth, gender, phone, email, city,
      talentCategory, subTalentDescription, experienceLevel, yearsOfExperience,
      portfolioLink,
      isRider, bikeModel, ridingExperience,
      shortDescription, whyParticipate,
      availableDates,
      openToPerformLive, openToCompetition,
      pastAchievements, socialMediaLinks,
      consentInfoTrue, consentRules, consentMedia,
      tshirtSize,
      otp,
    } = req.body;

    // Required field validation
    if (
      !fullName || !age || !dateOfBirth || !gender || !phone || !email || !city ||
      !talentCategory || !subTalentDescription || !experienceLevel || !yearsOfExperience ||
      !shortDescription || !whyParticipate || !availableDates || !tshirtSize || !otp
    ) {
      return res.status(400).json({ message: "Please fill all required fields, including Date of Birth and OTP." });
    }

    if (!consentInfoTrue || consentInfoTrue === "false") {
      return res.status(400).json({ message: "You must confirm that all information is true." });
    }
    if (!consentRules || consentRules === "false") {
      return res.status(400).json({ message: "You must agree to the event rules & safety guidelines." });
    }
    if (!consentMedia || consentMedia === "false") {
      return res.status(400).json({ message: "You must give permission for media use." });
    }

    // Verify OTP exists for this email
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
      type: "talent_signup",
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please verify your email first." });
    }

    const bucId = await generateUniqueBucId();

    const talentImageFile = req.files && req.files.talentImage ? req.files.talentImage[0] : null;
    const talentVideoFile = req.files && req.files.talentVideo ? req.files.talentVideo[0] : null;

    const talentData = {
      bucId,
      fullName,
      age: Number(age),
      dateOfBirth: dateOfBirth || null,
      gender,
      phone,
      email,
      city,
      talentCategory,
      tshirtSize,
      subTalentDescription,
      experienceLevel,
      yearsOfExperience: Number(yearsOfExperience),
      portfolioLink: portfolioLink || "",
      isRider: isRider === "true" || isRider === true,
      bikeModel: bikeModel || "",
      ridingExperience: ridingExperience || "",
      shortDescription,
      whyParticipate,
      availableDates,
      openToPerformLive: openToPerformLive === "true" || openToPerformLive === true,
      openToCompetition: openToCompetition === "true" || openToCompetition === true,
      pastAchievements: pastAchievements || "",
      socialMediaLinks: socialMediaLinks || "",
      consentInfoTrue: true,
      consentRules: true,
      consentMedia: true,
    };

    if (talentImageFile) {
      talentData.talentImage = talentImageFile.path;
      talentData.talentImagePublicId = talentImageFile.filename;
    }
    if (talentVideoFile) {
      talentData.talentVideo = talentVideoFile.path;
      talentData.talentVideoPublicId = talentVideoFile.filename;
    }

    const talent = new Talent(talentData);

    await talent.save();

    // Delete verified OTP record
    try {
      await Otp.deleteOne({ _id: otpRecord._id });
    } catch (otpDelError) {
      console.error("Failed to delete talent OTP:", otpDelError);
    }

    try {
      await sendRegistrationConfirmation(talent.email, {
        fullName: talent.fullName,
        tshirtSize: talent.tshirtSize,
        bucId: talent.bucId,
        clubName: "" // Talents don't register under a club directly in this form
      });
    } catch (mailError) {
      console.error("Failed to send welcome email to talent:", mailError);
    }

    res.status(201).json({ message: "Talent registration submitted successfully!", talent });
  } catch (error) {
    console.error("Talent Submit Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAllTalents = async (req, res) => {
  try {
    const talents = await Talent.find().sort({ createdAt: -1 });
    res.json(talents);
  } catch (error) {
    console.error("Get Talents Error:", error);
    res.status(500).json({ message: "Failed to fetch talent registrations." });
  }
};

export const deleteTalent = async (req, res) => {
  try {
    const { id } = req.params;
    const talent = await Talent.findById(id);

    if (!talent) {
      return res.status(404).json({ message: 'Talent registration not found' });
    }

    if (talent.talentImagePublicId) {
      try {
        await cloudinary.uploader.destroy(talent.talentImagePublicId);
      } catch (err) {
        console.error('Error deleting talent image from Cloudinary:', err);
      }
    }

    if (talent.talentVideoPublicId) {
      try {
        await cloudinary.uploader.destroy(talent.talentVideoPublicId, { resource_type: "video" });
      } catch (err) {
        console.error('Error deleting talent video from Cloudinary:', err);
      }
    }

    await Talent.findByIdAndDelete(id);
    res.json({ message: 'Talent registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
