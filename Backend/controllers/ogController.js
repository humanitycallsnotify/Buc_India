import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { findEventByIdentifier } from "../utils/findEventByIdentifier.js";
import {
  buildRegistrationShareMeta,
  getSiteUrl,
  injectMetaIntoHtml,
  buildMetaTagsHtml,
  escapeHtml
} from "../utils/ogMeta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INDEX_CANDIDATES = [
  path.resolve(process.cwd(), "..", "Frontend", "dist", "index.html"),
  path.resolve(process.cwd(), "..", "frontend", "dist", "index.html"),
  path.resolve(process.cwd(), "Frontend", "dist", "index.html"),
  path.resolve(process.cwd(), "frontend", "dist", "index.html"),
  path.resolve(__dirname, "..", "..", "Frontend", "dist", "index.html"),
  path.resolve(__dirname, "..", "..", "frontend", "dist", "index.html"),
  path.resolve(__dirname, "..", "..", "Frontend", "index.html"),
  path.resolve(__dirname, "..", "..", "frontend", "index.html"),
];

async function readIndexTemplate(req) {
  for (const candidate of INDEX_CANDIDATES) {
    try {
      return await fs.readFile(candidate, "utf8");
    } catch {
      // try next candidate
    }
  }
  
  const urlsToTry = [getSiteUrl()];
  if (req) {
    const host = req.get("x-forwarded-host") || req.get("host");
    if (host) {
      const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
      urlsToTry.push(`${protocol}://${host}`);
    }
  }
  urlsToTry.push("https://www.bucindia.com");
  urlsToTry.push("https://bucindia.com");

  for (const url of [...new Set(urlsToTry)]) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error(`Failed to fetch index.html from ${url}:`, error.message);
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
    const meta = buildRegistrationShareMeta(event, identifier, req);

    const metaTagsHtml = buildMetaTagsHtml(meta);
    
    // We redirect to /event-register-view/ to bypass the Hostinger /event-register/* rewrite rule
    // which would otherwise cause an infinite loop.
    const redirectUrl = meta.pageUrl.replace('/event-register/', '/event-register-view/');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />
  ${metaTagsHtml}
  <script>
    window.location.replace("${redirectUrl}");
  </script>
</head>
<body style="background:#111;color:#fff;font-family:sans-serif;text-align:center;padding-top:10vh;">
  <p>Redirecting to <a href="${redirectUrl}" style="color:#e97132;">${redirectUrl}</a>...</p>
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

export const serveSiteRootOgFallback = async (req, res, next) => {
  try {
    const htmlTemplate = await readIndexTemplate(req);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(htmlTemplate);
  } catch (error) {
    next(error);
  }
};

export const getSiteBaseUrl = () => getSiteUrl();
