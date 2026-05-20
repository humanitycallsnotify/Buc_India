import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { cloudinary } from "../middleware/cloudinaryConfig.js";

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
    const users = await User.find().sort({ createdAt: -1 });
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
    } = req.body;

    const isRider = registrationType === 'Rider' || registrationType === 'Student Rider';
    const isStudent = registrationType === 'Student' || registrationType === 'Student Rider';

    // 1. Mandatory overall validation (Common to ALL registration types)
    if (
      !phone || !fullName || !email || !password || !otp ||
      !address || !city || !state || !pincode || 
      !emergencyContactName || !emergencyContactPhone
    ) {
      return res.status(400).json({ 
        message: "Full Name, Phone, Email, Password, OTP, Address, and Emergency Contact details are required for all registrations." 
      });
    }

    // 2. Role-specific validation
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

    // Check if phone or email already exists
    const existingUser = await User.findOne({
      $or: [{ phone }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "Email" : "Phone number";
      return res
        .status(400)
        .json({
          message: `${field} is already registered.`,
        });
    }

    // Verify OTP exists for this email (Common to all)
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

    // File Upload Validation
    const profileImageFile = req.files && req.files.profileImage ? req.files.profileImage[0] : null;
    const licenseImageFile = req.files && req.files.licenseImage ? req.files.licenseImage[0] : null;

    if (!profileImageFile) {
      return res.status(400).json({ message: "Profile image upload is required." });
    }

    if (isRider && !licenseImageFile) {
      return res.status(400).json({ message: "License image upload is required for Riders." });
    }

    const userData = {
      registrationType,
      fullName,
      phone,
      email: email.toLowerCase(),
      password,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactPhone,
      facebookUrl: req.body.facebookUrl || "",
      instagramUrl: req.body.instagramUrl || "",
      twitterUrl: req.body.twitterUrl || "",
      youtubeUrl: req.body.youtubeUrl || "",
      websiteUrl: req.body.websiteUrl || "",
    };

    if (isRider) {
      userData.dateOfBirth = dateOfBirth;
      userData.bloodGroup = bloodGroup;
      userData.bikeModel = bikeModel;
      userData.bikeRegistrationNumber = bikeRegistrationNumber;
      userData.licenseNumber = licenseNumber;
    }

    if (isStudent) {
      userData.collegeName = collegeName;
      userData.collegeIdNo = collegeIdNo;
    }

    // Set Profile Image
    userData.profileImage = profileImageFile.path;
    userData.profileImagePublicId = profileImageFile.filename;

    // Set License Image if present/rider
    if (isRider && licenseImageFile) {
      userData.licenseImage = licenseImageFile.path;
      userData.licenseImagePublicId = licenseImageFile.filename;
    }

    const user = new User(userData);
    await user.save();

    // Clear OTP
    await Otp.deleteMany({ email: email.toLowerCase(), type: "signup" });

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
    const { email } = req.body; // In a real app, this would come from auth middleware

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required to identify the profile" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = { ...req.body };
    delete userData.password; // Don't allow password update here
    delete userData.email; // Don't allow email update here

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
