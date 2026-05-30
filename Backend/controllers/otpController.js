import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendOTP } from "../utils/mailSender.js";

export const requestOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!["signup", "forgot_password", "talent_signup", "club_signup"].includes(type)) {
      return res.status(400).json({ message: "Invalid OTP type" });
    }

    // For signup, check if email exists
    if (type === "signup") {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    // For forgot_password, check if email exists
    if (type === "forgot_password") {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (!existingUser) {
        return res
          .status(404)
          .json({ message: "No account found with this email" });
      }
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert OTP (update if exists for same email/type)
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase(), type },
      { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true },
    );

    // Send email
    await sendOTP(email.toLowerCase(), otp, type);

    res.json({ message: `OTP sent successfully to ${email}` });
  } catch (error) {
    console.error("Request OTP Error:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res
        .status(400)
        .json({ message: "Email, OTP and type are required" });
    }

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
      type,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if expired (though MongoDB should have cleaned it up, extra safety)
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Do NOT delete yet if it's for signup, we need it during create profile
    // Actually, for better security, we could mark it as verified
    // For simplicity, we'll check its existence in the create profile flow

    res.json({ message: "OTP verified successfully", verified: true });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
};
