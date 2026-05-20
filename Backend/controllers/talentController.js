import Talent from "../models/Talent.js";

export const submitTalent = async (req, res) => {
  try {
    const {
      fullName, age, gender, phone, email, city,
      talentCategory, subTalentDescription, experienceLevel, yearsOfExperience,
      portfolioLink,
      isRider, bikeModel, ridingExperience,
      shortDescription, whyParticipate,
      availableDates,
      openToPerformLive, openToCompetition,
      pastAchievements, socialMediaLinks,
      consentInfoTrue, consentRules, consentMedia,
    } = req.body;

    // Required field validation
    if (
      !fullName || !age || !gender || !phone || !email || !city ||
      !talentCategory || !subTalentDescription || !experienceLevel || !yearsOfExperience ||
      !shortDescription || !whyParticipate || !availableDates
    ) {
      return res.status(400).json({ message: "Please fill all required fields." });
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

    const talent = new Talent({
      fullName,
      age: Number(age),
      gender,
      phone,
      email,
      city,
      talentCategory,
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
    });

    await talent.save();
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
