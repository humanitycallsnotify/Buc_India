import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getHumanityCallsCarousel,
  updateHumanityCallsCarousel,
} from "../controllers/siteContentController.js";

const router = express.Router();

router.get("/humanity-calls-carousel", getHumanityCallsCarousel);
router.put("/humanity-calls-carousel", protect, updateHumanityCallsCarousel);

export default router;
