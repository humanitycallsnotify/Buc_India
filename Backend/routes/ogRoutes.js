import express from "express";
import {
  serveEventRegisterOgHtml,
  getRegistrationShareMeta,
} from "../controllers/ogController.js";

const router = express.Router();

router.get("/event-register/:identifier/meta", getRegistrationShareMeta);
router.get("/event-register/:identifier", serveEventRegisterOgHtml);

export default router;
