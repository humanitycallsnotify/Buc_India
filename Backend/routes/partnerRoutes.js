import express from "express";
import { getPartners, createPartner, deletePartner } from "../controllers/partnerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { partnerUpload } from "../middleware/cloudinaryConfig.js";

const router = express.Router();

router.get("/", getPartners);
router.post("/", protect, partnerUpload.single("image"), createPartner);
router.delete("/:id", protect, deletePartner);

export default router;
