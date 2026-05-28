import express from "express";
import {
  submitTalent,
  getAllTalents,
  approveTalent,
  updateTalent,
  deleteTalent,
} from "../controllers/talentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: submit talent registration
router.post("/", submitTalent);

// Admin only: get all talent registrations
router.get("/", protect, getAllTalents);
router.patch("/:id/approve", protect, approveTalent);
router.put("/:id", protect, updateTalent);
router.delete("/:id", protect, deleteTalent);

export default router;
