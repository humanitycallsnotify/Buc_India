import express from "express";
import { submitTalent, getAllTalents } from "../controllers/talentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: submit talent registration
router.post("/", submitTalent);

// Admin only: get all talent registrations
router.get("/", protect, getAllTalents);

export default router;
