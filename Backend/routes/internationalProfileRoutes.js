import express from "express";
import {
  getPublicProfiles,
  getAllProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/internationalProfileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { contentUpload } from "../middleware/cloudinaryConfig.js";

const router = express.Router();

router.get("/public", getPublicProfiles);
router.get("/", protect, getAllProfiles);
router.post(
  "/",
  protect,
  contentUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "profileVideo", maxCount: 1 },
  ]),
  createProfile
);
router.put(
  "/:id",
  protect,
  contentUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "profileVideo", maxCount: 1 },
  ]),
  updateProfile
);
router.delete("/:id", protect, deleteProfile);

export default router;
