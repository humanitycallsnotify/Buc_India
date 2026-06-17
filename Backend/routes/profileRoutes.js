import express from "express";
import {
  getProfile,
  getAllProfiles,
  userSignup,
  userLogin,
  updateUserProfile,
  deleteUserProfile,
  checkPhoneRegistered,
  checkEmailRegistered,
} from "../controllers/profileController.js";
import { profileUpload } from "../middleware/cloudinaryConfig.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", getAllProfiles);
router.get("/phone-registered", checkPhoneRegistered);
router.get("/email-registered", checkEmailRegistered);
router.get("/", getProfile);

router.post(
  "/signup",
  profileUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
  ]),
  userSignup,
);

router.post("/login", userLogin);

router.put(
  "/update",
  profileUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
  ]),
  updateUserProfile,
);

router.delete("/:id", protect, deleteUserProfile);

export default router;
