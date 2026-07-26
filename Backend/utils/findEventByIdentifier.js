import mongoose from "mongoose";
import Event from "../models/Event.js";
import { slugify } from "./slugify.js";

const PUBLIC_EVENT_FIELDS =
  "title description banner eventDate location meetingPoint isActive";

export async function findEventByIdentifier(identifier) {
  if (!identifier || identifier === "community") {
    return null;
  }

  const normalized = String(identifier).trim();

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    const byId = await Event.findById(normalized).select(PUBLIC_EVENT_FIELDS);
    if (byId) return byId;
  }

  const events = await Event.find({ isActive: { $ne: false } }).select(
    PUBLIC_EVENT_FIELDS,
  );
  return events.find((event) => slugify(event.title) === normalized) || null;
}
