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

    if (!email || !phone || !password || !otp) {
      return res
        .status(400)
        .json({ message: "Email, phone, password and OTP are required" });
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "Email" : "Phone number";
      return res
        .status(400)
        .json({
          message: `${field} is already registered. Please login instead.`,
        });
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

    const userData = {
      email: email.toLowerCase(),
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
      facebookUrl: req.body.facebookUrl || "",
      instagramUrl: req.body.instagramUrl || "",
      twitterUrl: req.body.twitterUrl || "",
      youtubeUrl: req.body.youtubeUrl || "",
      websiteUrl: req.body.websiteUrl || "",
    };

    if (req.files && req.files.profileImage) {
      userData.profileImage = req.files.profileImage[0].path;
      userData.profileImagePublicId = req.files.profileImage[0].filename;
    }

    if (req.files && req.files.licenseImage) {
      userData.licenseImage = req.files.licenseImage[0].path;
      userData.licenseImagePublicId = req.files.licenseImage[0].filename;
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
