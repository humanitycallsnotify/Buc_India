import User from "../models/User.js";
import Otp from "../models/Otp.js";
import Club from "../models/Club.js";
import { cloudinary } from "../middleware/cloudinaryConfig.js";
import { generateUniqueBucId } from "../utils/generateBucId.js";
import { sendRegistrationConfirmation } from "../utils/mailSender.js";

export const getProfile = async (req, res) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    const query = {};
    if (email) query.email = email.toLowerCase();
    if (phone) query.phone = phone;

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const users = await User.find().populate('clubId', 'name').sort({ createdAt: 1 });
    res.json(users);
  } catch (error) {
    console.error("Get All Profiles Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const userSignup = async (req, res) => {
  try {
    const {
      registrationType = 'Rider',
      collegeName,
      collegeIdNo,
      email,
      phone,
      password,
      fullName,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      state,
      pincode,
      bikeModel,
      bikeRegistrationNumber,
      licenseNumber,
      emergencyContactName,
      emergencyContactPhone,
      otp,
      tshirtSize,
      clubId,
      riderPhone,
      riderRegistrationId,
    } = req.body;

    const isRider = registrationType === 'Rider' || registrationType === 'Student Rider';
    const isStudent = registrationType === 'Student' || registrationType === 'Student Rider';
    const isPS = registrationType === 'PS';
    const isPublicUser = registrationType === 'Public User';
    const isPillion = registrationType === 'Pillion';

    // Check if it's a detailed registration (e.g. from the registration forms in registration branch)
    // We determine this by checking if address or tshirtSize is provided.
    const isDetailed = !!address || !!city || !!state || !!pincode || !!tshirtSize;

    // 1. Mandatory overall validation (Common to ALL registration types)
    if (isDetailed) {
      if (!phone || !fullName || !address || !city || !state || !pincode || !tshirtSize) {
        return res.status(400).json({ 
          message: "Full Name, Phone, T-Shirt Size, and Address details are required for all registrations." 
        });
      }
    } else {
      if (!phone || !fullName) {
        return res.status(400).json({ 
          message: "Full Name and Phone are required." 
        });
      }
    }

    if (!isPS) {
      if (!email || !password || !otp) {
        return res.status(400).json({ 
          message: "Email, Password, and OTP are required." 
        });
      }
      if (isDetailed && !isPublicUser && (!emergencyContactName || !emergencyContactPhone)) {
        return res.status(400).json({ 
          message: "Emergency Contact details are required." 
        });
      }
    }

    // 2. Role-specific validation
    if (isDetailed) {
      if (isRider) {
        if (!bikeModel || !bikeRegistrationNumber || !licenseNumber) {
          return res.status(400).json({ 
            message: "Bike details and license details are required for Rider registrations." 
          });
        }
      }
      
      if (isStudent) {
        if (!collegeName || !collegeIdNo) {
          return res.status(400).json({ 
            message: "College Name and Student ID Number are required for Student registrations." 
          });
        }
      }

      if (isPillion) {
        if (!riderPhone) {
          return res.status(400).json({ 
            message: "Rider Phone is required for Pillion registrations." 
          });
        }
      }
    }

    if (!isPS) {
      const existingUser = await User.findOne({
        $or: [{ phone }, { email: email.toLowerCase() }],
      });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? "Email" : "Phone number";
        return res.status(400).json({ message: `${field} is already registered.` });
      }

      // Verify OTP exists for this email
      const otpRecord = await Otp.findOne({
        email: email.toLowerCase(),
        otp,
        type: "signup",
      });

      if (!otpRecord) {
        return res.status(400).json({
          message: "Invalid or expired OTP. Please verify your email first.",
        });
      }
    } else {
      // For PS, just check phone
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: "Phone number is already registered." });
      }
    }

    // File Upload Validation
    const profileImageFile = req.files && req.files.profileImage ? req.files.profileImage[0] : null;
    const licenseImageFile = req.files && req.files.licenseImage ? req.files.licenseImage[0] : null;

    if (isDetailed && !isPS && !isPublicUser && !profileImageFile) {
      return res.status(400).json({ message: "Profile image upload is required." });
    }

    if (isDetailed && isRider && !licenseImageFile) {
      return res.status(400).json({ message: "License image upload is required for Riders." });
    }

    const bucId = await generateUniqueBucId();

    let parsedSocialLinks = [];
    let facebookUrlVal = req.body.facebookUrl || "";
    let instagramUrlVal = req.body.instagramUrl || "";
    let twitterUrlVal = req.body.twitterUrl || "";
    let youtubeUrlVal = req.body.youtubeUrl || "";
    let websiteUrlVal = req.body.websiteUrl || "";

    if (req.body.socialLinks) {
      try {
        parsedSocialLinks = typeof req.body.socialLinks === "string" ? JSON.parse(req.body.socialLinks) : req.body.socialLinks;
        if (Array.isArray(parsedSocialLinks)) {
          parsedSocialLinks.forEach(link => {
            if (link.platform && link.url) {
              const platformLower = link.platform.toLowerCase();
              if (platformLower === "facebook") facebookUrlVal = link.url;
              else if (platformLower === "instagram") instagramUrlVal = link.url;
              else if (platformLower === "twitter" || platformLower === "x") twitterUrlVal = link.url;
              else if (platformLower === "youtube") youtubeUrlVal = link.url;
              else if (platformLower === "website") websiteUrlVal = link.url;
            }
          });
        }
      } catch (e) {
        console.error("Error parsing socialLinks in userSignup:", e);
      }
    } else {
      if (req.body.facebookUrl) parsedSocialLinks.push({ platform: "facebook", url: req.body.facebookUrl });
      if (req.body.instagramUrl) parsedSocialLinks.push({ platform: "instagram", url: req.body.instagramUrl });
      if (req.body.twitterUrl) parsedSocialLinks.push({ platform: "twitter", url: req.body.twitterUrl });
      if (req.body.youtubeUrl) parsedSocialLinks.push({ platform: "youtube", url: req.body.youtubeUrl });
      if (req.body.websiteUrl) parsedSocialLinks.push({ platform: "website", url: req.body.websiteUrl });
    }

    const userData = {
      bucId,
      registrationType,
      fullName,
      phone,
      gender: gender || "",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      tshirtSize: tshirtSize || "",
      clubId: clubId || null,
      socialLinks: parsedSocialLinks,
    };

    if (!isPS) {
      userData.email = email.toLowerCase();
      userData.password = password;
      userData.emergencyContactName = emergencyContactName || "";
      userData.emergencyContactPhone = emergencyContactPhone || "";
      userData.facebookUrl = facebookUrlVal;
      userData.instagramUrl = instagramUrlVal;
      userData.twitterUrl = twitterUrlVal;
      userData.youtubeUrl = youtubeUrlVal;
      userData.websiteUrl = websiteUrlVal;
    }

    if (isPS) {
      userData.bikeModel = bikeModel || "";
      userData.bikeRegistrationNumber = bikeRegistrationNumber || "";
    }

    if (isRider) {
      userData.dateOfBirth = dateOfBirth || null;
      userData.bloodGroup = bloodGroup || "";
      userData.bikeModel = bikeModel || "";
      userData.bikeRegistrationNumber = bikeRegistrationNumber || "";
      userData.licenseNumber = licenseNumber || "";
    }

    if (isStudent) {
      userData.collegeName = collegeName || "";
      userData.collegeIdNo = collegeIdNo || "";
    }

    if (isPillion) {
      userData.riderPhone = riderPhone || "";
      userData.riderRegistrationId = riderRegistrationId || "";
    }

    // Set Profile Image
    if (profileImageFile) {
      userData.profileImage = profileImageFile.path;
      userData.profileImagePublicId = profileImageFile.filename;
    }

    // Set License Image if present/rider
    if (isRider && licenseImageFile) {
      userData.licenseImage = licenseImageFile.path;
      userData.licenseImagePublicId = licenseImageFile.filename;
    }

    const user = new User(userData);
    await user.save();

    // Clear OTP
    if (email) {
      await Otp.deleteMany({ email: email.toLowerCase(), type: "signup" });
    }

    // Send confirmation email
    if (!isPS) {
      let clubName = "";
      if (clubId) {
        const club = await Club.findById(clubId);
        if (club) clubName = club.name;
      }
      try {
        await sendRegistrationConfirmation(userData.email, {
          fullName: userData.fullName,
          tshirtSize: userData.tshirtSize,
          bucId: userData.bucId,
          clubName: clubName
        });
      } catch (mailError) {
        console.error("Failed to send welcome email:", mailError);
        // Do not fail the registration if email fails
      }
    }

    // Don't send password back
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("User Signup Error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error("User Login Error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id, userId, email } = req.body;

    let user;
    if (id || userId) {
      user = await User.findById(id || userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found to update" });
    }

    const userData = { ...req.body };
    delete userData.password; // Don't allow password update here
    delete userData.email; // Don't allow email update here

    let parsedSocialLinks = null;
    if (userData.socialLinks) {
      try {
        parsedSocialLinks = typeof userData.socialLinks === "string" ? JSON.parse(userData.socialLinks) : userData.socialLinks;
        if (Array.isArray(parsedSocialLinks)) {
          userData.socialLinks = parsedSocialLinks;
          parsedSocialLinks.forEach(link => {
            if (link.platform && link.url) {
              const platformLower = link.platform.toLowerCase();
              if (platformLower === "facebook") userData.facebookUrl = link.url;
              else if (platformLower === "instagram") userData.instagramUrl = link.url;
              else if (platformLower === "twitter" || platformLower === "x") userData.twitterUrl = link.url;
              else if (platformLower === "youtube") userData.youtubeUrl = link.url;
              else if (platformLower === "website") userData.websiteUrl = link.url;
            }
          });
        }
      } catch (e) {
        console.error("Error parsing socialLinks in updateUserProfile:", e);
      }
    } else {
      const hasLegacyField = 'facebookUrl' in userData || 'instagramUrl' in userData || 'twitterUrl' in userData || 'youtubeUrl' in userData || 'websiteUrl' in userData;
      if (hasLegacyField) {
        parsedSocialLinks = [];
        const fb = 'facebookUrl' in userData ? userData.facebookUrl : user.facebookUrl;
        const insta = 'instagramUrl' in userData ? userData.instagramUrl : user.instagramUrl;
        const tw = 'twitterUrl' in userData ? userData.twitterUrl : user.twitterUrl;
        const yt = 'youtubeUrl' in userData ? userData.youtubeUrl : user.youtubeUrl;
        const web = 'websiteUrl' in userData ? userData.websiteUrl : user.websiteUrl;
        
        if (fb) parsedSocialLinks.push({ platform: "facebook", url: fb });
        if (insta) parsedSocialLinks.push({ platform: "instagram", url: insta });
        if (tw) parsedSocialLinks.push({ platform: "twitter", url: tw });
        if (yt) parsedSocialLinks.push({ platform: "youtube", url: yt });
        if (web) parsedSocialLinks.push({ platform: "website", url: web });
        userData.socialLinks = parsedSocialLinks;
      }
    }

    if (userData.clubId === "" || userData.clubId === "null" || userData.clubId === "undefined") {
      userData.clubId = null;
    }

    // Handle profile image upload if provided
    if (req.files && req.files.profileImage) {
      if (user.profileImagePublicId) {
        try {
          await cloudinary.uploader.destroy(user.profileImagePublicId);
        } catch (e) {
          console.warn("Could not delete old profile image:", e.message);
        }
      }
      userData.profileImage = req.files.profileImage[0].path;
      userData.profileImagePublicId = req.files.profileImage[0].filename;
    }

    // Handle license image upload if provided
    if (req.files && req.files.licenseImage) {
      if (user.licenseImagePublicId) {
        try {
          await cloudinary.uploader.destroy(user.licenseImagePublicId);
        } catch (e) {
          console.warn("Could not delete old license image:", e.message);
        }
      }
      userData.licenseImage = req.files.licenseImage[0].path;
      userData.licenseImagePublicId = req.files.licenseImage[0].filename;
    }

    user = await User.findOneAndUpdate({ _id: user._id }, userData, {
      new: true,
      runValidators: true,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile image from Cloudinary if exists
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (e) {
        console.warn("Could not delete profile image from Cloudinary:", e.message);
      }
    }

    // Delete license image from Cloudinary if exists
    if (user.licenseImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.licenseImagePublicId);
      } catch (e) {
        console.warn("Could not delete license image from Cloudinary:", e.message);
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: error.message || "Failed to delete user" });
  }
};
