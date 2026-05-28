import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import User from "../models/User.js";
import ClubMembership from "../models/ClubMembership.js";
import Certificate from "../models/Certificate.js";
import { cloudinary } from "../middleware/cloudinaryConfig.js";
import { sendRegistrationConfirmation } from "../utils/mailSender.js";
import {
  validateRegistrationPayload,
  getResolvedClubName,
  getRegistrationTypeLabel,
} from "../utils/registrationValidation.js";

const buildDuplicateQuery = (eventId, body) => {
  const orConditions = [
    { email: body.email?.toLowerCase() },
    { phone: body.phone },
  ];
  if (body.bikeRegistrationNumber?.trim()) {
    orConditions.push({
      bikeRegistrationNumber: body.bikeRegistrationNumber.trim(),
    });
  }
  if (body.licenseNumber?.trim()) {
    orConditions.push({ licenseNumber: body.licenseNumber.trim() });
  }
  return { eventId, $or: orConditions };
};

export const createRegistration = async (req, res) => {
  console.log("Incoming Registration Request:", {
    body: req.body,
    files: req.files ? Object.keys(req.files) : "no files",
  });
  try {
    const {
      eventId,
      fullName,
      email,
      phone,
      registrationType,
      clubName,
      clubNameCustom,
      collegeName,
      department,
      year,
      ridingExperience,
      interestReason,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      youtubeUrl,
      websiteUrl,
      acceptedTerms,
      riderPhone,
      riderRegistrationId,
      hasLinkedPillion,
      linkedPillionName,
      linkedPillionMobile,
      linkedPillionTShirtSize,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      bikeModel,
      bikeRegistrationNumber,
      licenseNumber,
      anyMedicalCondition,
      tShirtSize,
      requestRidingGears,
      requestedGears,
    } = req.body;

    const { errors, isLegacy } = validateRegistrationPayload(req.body);

    if (!isLegacy) {
      if (errors.length > 0) {
        return res.status(400).json({ message: errors[0], errors });
      }
    }

    const existingUser = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { phone: phone }],
    });

    if (isLegacy) {
      if (eventId !== "community") {
        const hasUploadedLicense = req.files && req.files.licenseImage;
        const hasExistingLicense = existingUser && existingUser.licenseImage;
        if (!hasUploadedLicense && !hasExistingLicense) {
          return res
            .status(400)
            .json({ message: "Driving license image is mandatory" });
        }
      }

      if (eventId !== "community") {
        const hasUploadedProfile = req.files && req.files.profileImage;
        const hasExistingProfile = existingUser && existingUser.profileImage;
        if (!hasUploadedProfile && !hasExistingProfile) {
          return res
            .status(400)
            .json({ message: "Profile picture is mandatory" });
        }
      }

      if (eventId !== "community" && dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < dob.getDate())
        ) {
          age--;
        }
        if (age < 18) {
          return res
            .status(400)
            .json({ message: "You must be at least 18 years old to register" });
        }
      }
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 10 digits" });
    }

    if (
      emergencyContactPhone &&
      !/^\d{10}$/.test(emergencyContactPhone)
    ) {
      return res.status(400).json({
        message: "Emergency contact phone number must be exactly 10 digits",
      });
    }

    const duplicate = await Registration.findOne(
      buildDuplicateQuery(eventId, req.body),
    );

    if (duplicate) {
      let field = "Details";
      if (duplicate.email === email?.toLowerCase()) field = "Email";
      else if (duplicate.phone === phone) field = "Phone number";
      else if (
        duplicate.bikeRegistrationNumber === bikeRegistrationNumber?.trim()
      )
        field = "Bike registration number";
      else if (duplicate.licenseNumber === licenseNumber?.trim())
        field = "License number";

      return res
        .status(400)
        .json({ message: `${field} is already registered` });
    }

    const resolvedClub = getResolvedClubName(req.body);

    const registrationData = {
      eventId,
      fullName,
      email: email?.toLowerCase(),
      phone,
      registrationType: registrationType || "",
      clubName: clubName || "",
      clubNameCustom: clubNameCustom || "",
      collegeName: collegeName || "",
      department: department || "",
      year: year || "",
      ridingExperience: ridingExperience || "",
      interestReason: interestReason || "",
      tShirtSize: tShirtSize || "",
      hasLinkedPillion: false,
      linkedPillion: { name: "", mobile: "", tShirtSize: "" },
      riderReference: {
        riderRegistrationId: "",
        riderPhone: "",
        riderName: "",
      },
      licenseImage: "",
      licenseImagePublicId: "",
      profileImage: "",
      profileImagePublicId: "",
    };

    if (isLegacy && eventId !== "community") {
      registrationData.dateOfBirth = dateOfBirth;
      registrationData.bloodGroup = bloodGroup;
      registrationData.address = address;
      registrationData.city = city;
      registrationData.state = state;
      registrationData.pincode = pincode;
      registrationData.emergencyContactName = emergencyContactName;
      registrationData.emergencyContactPhone = emergencyContactPhone;
      registrationData.bikeModel = bikeModel;
      registrationData.bikeRegistrationNumber = bikeRegistrationNumber;
      registrationData.licenseNumber = licenseNumber;
      registrationData.anyMedicalCondition = anyMedicalCondition;
      registrationData.tShirtSize = tShirtSize;

      if (req.files && req.files.licenseImage) {
        registrationData.licenseImage = req.files.licenseImage[0].path;
        registrationData.licenseImagePublicId =
          req.files.licenseImage[0].filename;
      } else if (existingUser && existingUser.licenseImage) {
        registrationData.licenseImage = existingUser.licenseImage;
        registrationData.licenseImagePublicId =
          existingUser.licenseImagePublicId;
      }

      if (req.files && req.files.profileImage) {
        registrationData.profileImage = req.files.profileImage[0].path;
        registrationData.profileImagePublicId =
          req.files.profileImage[0].filename;
      } else if (existingUser && existingUser.profileImage) {
        registrationData.profileImage = existingUser.profileImage;
        registrationData.profileImagePublicId =
          existingUser.profileImagePublicId;
      }

      if (requestRidingGears === "true" || requestRidingGears === true) {
        registrationData.requestRidingGears = true;
        if (requestedGears) {
          try {
            registrationData.requestedGears =
              typeof requestedGears === "string"
                ? JSON.parse(requestedGears)
                : requestedGears;
          } catch {
            registrationData.requestedGears = {};
          }
        } else {
          registrationData.requestedGears = {};
        }
      } else {
        registrationData.requestRidingGears = false;
        registrationData.requestedGears = {};
      }
    } else if (!isLegacy) {
      registrationData.dateOfBirth = dateOfBirth || undefined;
      registrationData.bloodGroup = bloodGroup || "";
      registrationData.address = address || "";
      registrationData.city = city || "";
      registrationData.state = state || "";
      registrationData.pincode = pincode || "";
      registrationData.emergencyContactName = emergencyContactName || "";
      registrationData.emergencyContactPhone = emergencyContactPhone || "";
      registrationData.bikeModel = bikeModel || "";
      registrationData.bikeRegistrationNumber = bikeRegistrationNumber || "";
      registrationData.licenseNumber = licenseNumber || "";
      registrationData.anyMedicalCondition = anyMedicalCondition || "";
      registrationData.tShirtSize = tShirtSize || "";
      registrationData.facebookUrl = facebookUrl || "";
      registrationData.instagramUrl = instagramUrl || "";
      registrationData.twitterUrl = twitterUrl || "";
      registrationData.youtubeUrl = youtubeUrl || "";
      registrationData.websiteUrl = websiteUrl || "";
      registrationData.acceptedTerms =
        acceptedTerms === true || acceptedTerms === "true";
      registrationData.requestRidingGears = false;
      registrationData.requestedGears = {};

      if (registrationType === "rider") {
        registrationData.hasLinkedPillion =
          hasLinkedPillion === true || hasLinkedPillion === "true";
        if (registrationData.hasLinkedPillion) {
          registrationData.linkedPillion = {
            name: linkedPillionName || "",
            mobile: linkedPillionMobile || "",
            tShirtSize: linkedPillionTShirtSize || "",
          };
        }
      }

      if (registrationType === "pillion") {
        registrationData.riderReference = {
          riderRegistrationId: riderRegistrationId || "",
          riderPhone: riderPhone || "",
          riderName: "",
        };

        let mappedRider = null;
        if (riderRegistrationId && mongoose.Types.ObjectId.isValid(riderRegistrationId)) {
          mappedRider = await Registration.findById(riderRegistrationId)
            .select("fullName phone registrationType");
        }
        if (!mappedRider && riderPhone) {
          mappedRider = await Registration.findOne({
            phone: riderPhone,
            registrationType: "rider",
          }).select("fullName phone registrationType");
        }
        if (!mappedRider || mappedRider.registrationType !== "rider") {
          return res.status(400).json({
            message:
              "Unable to map pillion to rider. Check rider phone or registration ID.",
          });
        }
        registrationData.riderReference = {
          riderRegistrationId: String(mappedRider._id),
          riderPhone: mappedRider.phone || riderPhone || "",
          riderName: mappedRider.fullName || "",
        };
      }

      if (registrationType === "rider") {
        if (req.files?.licenseImage) {
          registrationData.licenseImage = req.files.licenseImage[0].path;
          registrationData.licenseImagePublicId =
            req.files.licenseImage[0].filename;
        } else if (existingUser?.licenseImage) {
          registrationData.licenseImage = existingUser.licenseImage;
          registrationData.licenseImagePublicId =
            existingUser.licenseImagePublicId;
        }
        if (req.files?.profileImage) {
          registrationData.profileImage = req.files.profileImage[0].path;
          registrationData.profileImagePublicId =
            req.files.profileImage[0].filename;
        } else if (existingUser?.profileImage) {
          registrationData.profileImage = existingUser.profileImage;
          registrationData.profileImagePublicId =
            existingUser.profileImagePublicId;
        }
      }
    }

    const registration = new Registration(registrationData);
    const newRegistration = await registration.save();

    if (registrationType && email) {
      sendRegistrationConfirmation({
        email: email.toLowerCase(),
        fullName,
        registrationTypeLabel: getRegistrationTypeLabel(registrationType),
      }).catch((err) =>
        console.error("Registration confirmation email failed:", err.message),
      );
    }

    if (isLegacy && eventId !== "community" && existingUser) {
      try {
        const activeMembership = await ClubMembership.findOne({
          userId: existingUser._id,
          status: "active",
        }).select("clubId");

        await Certificate.findOneAndUpdate(
          { userId: existingUser._id, eventId: newRegistration.eventId },
          {
            userId: existingUser._id,
            eventId: newRegistration.eventId,
            clubId: activeMembership ? activeMembership.clubId : null,
            participantName: fullName || existingUser.fullName || email,
            status: "ready",
            generatedAt: new Date(),
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
      } catch (certErr) {
        console.error("Certificate upsert error (non-fatal):", certErr.message);
      }
    }

    const response = newRegistration.toObject();
    response.resolvedClubName = resolvedClub;

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      let field =
        Object.keys(keyPattern).find((k) => k !== "eventId") ||
        Object.keys(keyPattern)[0];

      const fieldLabels = {
        email: "Email",
        phone: "Phone number",
        bikeRegistrationNumber: "Bike registration number",
        licenseNumber: "License number",
      };

      const label =
        fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
      return res.status(400).json({
        message: `${label} is already registered for this particular event.`,
      });
    }

    res.status(400).json({ message: error.message });
  }
};

export const getRegistrations = async (req, res) => {
  try {
    const { eventId, email, phone, clubName, registrationType } = req.query;
    let filter = {};

    if (eventId && eventId !== "all") {
      if (eventId === "community") {
        filter.eventId = "community";
      } else if (mongoose.Types.ObjectId.isValid(eventId)) {
        filter.$or = [
          { eventId: eventId },
          { eventId: new mongoose.Types.ObjectId(eventId) },
        ];
      } else {
        filter.eventId = eventId;
      }
    }

    if (email) {
      filter.email = email.toLowerCase();
    }

    if (phone) {
      filter.phone = phone;
    }

    if (registrationType) {
      filter.registrationType = registrationType;
    }

    let registrations = await Registration.find(filter)
      .populate("eventId", "title eventDate")
      .sort({ registeredAt: -1 });

    if (clubName && clubName.trim()) {
      const clubSearch = clubName.trim().toLowerCase();
      registrations = registrations.filter((reg) => {
        const resolved =
          reg.clubName === "Others" && reg.clubNameCustom
            ? reg.clubNameCustom
            : reg.clubName;
        return resolved && resolved.toLowerCase().includes(clubSearch);
      });
    }

    registrations = registrations.filter((reg) => {
      if (reg.eventId === "community") return true;
      return reg.eventId !== null && reg.eventId !== undefined;
    });

    const enriched = registrations.map((reg) => {
      const obj = reg.toObject();
      obj.resolvedClubName =
        obj.clubName === "Others" && obj.clubNameCustom
          ? obj.clubNameCustom
          : obj.clubName || obj.clubNameCustom || "";
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (registration.licenseImagePublicId) {
      await cloudinary.uploader.destroy(registration.licenseImagePublicId);
    }

    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
