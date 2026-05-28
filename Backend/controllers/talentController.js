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

export const approveTalent = async (req, res) => {
  try {
    const talent = await Talent.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "approved", approvedAt: new Date() },
      { new: true },
    );
    if (!talent) {
      return res.status(404).json({ message: "Talent registration not found." });
    }
    res.json({ message: "Talent approved successfully.", talent });
  } catch (error) {
    console.error("Approve Talent Error:", error);
    res.status(500).json({ message: "Failed to approve talent registration." });
  }
};

export const updateTalent = async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "age",
      "gender",
      "phone",
      "email",
      "city",
      "tshirtSize",
      "talentCategory",
      "subTalentDescription",
      "experienceLevel",
      "yearsOfExperience",
      "portfolioLink",
      "isRider",
      "bikeModel",
      "ridingExperience",
      "shortDescription",
      "whyParticipate",
      "availableDates",
      "openToPerformLive",
      "openToCompetition",
      "pastAchievements",
      "socialMediaLinks",
      "approvalStatus",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, "age")) {
      updates.age = Number(updates.age);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "yearsOfExperience")) {
      updates.yearsOfExperience = Number(updates.yearsOfExperience);
    }
    if (Object.prototype.hasOwnProperty.call(updates, "isRider")) {
      updates.isRider = updates.isRider === true || updates.isRider === "true";
    }
    if (Object.prototype.hasOwnProperty.call(updates, "openToPerformLive")) {
      updates.openToPerformLive =
        updates.openToPerformLive === true || updates.openToPerformLive === "true";
    }
    if (Object.prototype.hasOwnProperty.call(updates, "openToCompetition")) {
      updates.openToCompetition =
        updates.openToCompetition === true || updates.openToCompetition === "true";
    }
    if (Object.prototype.hasOwnProperty.call(updates, "approvalStatus")) {
      if (updates.approvalStatus === "approved") {
        updates.approvedAt = new Date();
      } else {
        updates.approvedAt = null;
      }
    }

    const talent = await Talent.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!talent) {
      return res.status(404).json({ message: "Talent registration not found." });
    }
    res.json({ message: "Talent registration updated successfully.", talent });
  } catch (error) {
    console.error("Update Talent Error:", error);
    res.status(400).json({ message: error.message || "Failed to update talent." });
  }
};

export const deleteTalent = async (req, res) => {
  try {
    const deleted = await Talent.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Talent registration not found." });
    }
    res.json({ message: "Talent registration deleted successfully." });
  } catch (error) {
    console.error("Delete Talent Error:", error);
    res.status(500).json({ message: "Failed to delete talent registration." });
  }
};
