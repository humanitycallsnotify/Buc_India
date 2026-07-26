import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { findEventByIdentifier } from "../utils/findEventByIdentifier.js";
import {
  buildRegistrationShareMeta,
  getSiteUrl,
  injectMetaIntoHtml,
} from "../utils/ogMeta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INDEX_CANDIDATES = [
  path.resolve(process.cwd(), "..", "Frontend", "dist", "index.html"),
  path.resolve(process.cwd(), "Frontend", "dist", "index.html"),
  path.resolve(__dirname, "..", "..", "Frontend", "dist", "index.html"),
  path.resolve(__dirname, "..", "..", "Frontend", "index.html"),
];

async function readIndexTemplate() {
  for (const candidate of INDEX_CANDIDATES) {
    try {
      return await fs.readFile(candidate, "utf8");
    } catch {
      // try next candidate
    }
  }
  throw new Error("Unable to locate frontend index.html template for OG rendering.");
}

export const getPublicEvent = async (req, res) => {
  try {
    const event = await findEventByIdentifier(req.params.identifier);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({
      _id: event._id,
      title: event.title,
      description: event.description,
      banner: event.banner,
      eventDate: event.eventDate,
      location: event.location,
      meetingPoint: event.meetingPoint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRegistrationShareMeta = async (req, res) => {
  try {
    const { identifier } = req.params;
    const event = await findEventByIdentifier(identifier);
    const meta = buildRegistrationShareMeta(event, identifier);
    res.json(meta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const serveEventRegisterOgHtml = async (req, res) => {
  try {
    const { identifier } = req.params;
    const event = await findEventByIdentifier(identifier);
    const meta = buildRegistrationShareMeta(event, identifier);
    const metaTagsHtml = buildMetaTagsHtml(meta);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  ${metaTagsHtml}
  <script>
    window.location.replace("${meta.pageUrl}");
  </script>
</head>
<body>
  <p>Redirecting to <a href="${meta.pageUrl}">${meta.pageUrl}</a>...</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(event ? 200 : 404);
    res.send(html);
  } catch (error) {
    console.error("OG HTML render failed:", error.message);
    res.status(500).send("Unable to render registration preview page.");
  }
};

export const serveSiteRootOgFallback = async (_req, res, next) => {
  try {
    const htmlTemplate = await readIndexTemplate();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(htmlTemplate);
  } catch (error) {
    next(error);
  }
};

export const getSiteBaseUrl = () => getSiteUrl();
