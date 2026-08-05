const SITE_NAME = "Bikers Unity Calls";
const DEFAULT_DESCRIPTION =
  "Register for BUC India motorcycle events, group rides, and touring adventures across India.";

export const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const truncateDescription = (value = "", maxLength = 200) => {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
};

export const getSiteUrl = () => {
  const configured = process.env.FRONTEND_URL || process.env.SITE_URL;
  if (configured) {
    const firstUrl = configured.split(',')[0].trim();
    return firstUrl.replace(/\/$/, "");
  }
  return "https://bucindia.com";
};

export const getRegistrationUrl = (eventId) =>
  `${getSiteUrl()}/event-register/${eventId}`;

export const getOgImageUrl = (bannerUrl, siteUrl = getSiteUrl()) => {
  const fallback = `${siteUrl}/background-bikers.jpg`;

  if (!bannerUrl || !String(bannerUrl).trim()) {
    return fallback;
  }

  const url = String(bannerUrl).trim();

  // Resize and heavily compress for WhatsApp (under 300kb limit), preserving aspect ratio
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("/upload/c_limit,w_1200,h_1200")) {
      return url;
    }
    return url.replace("/upload/", "/upload/c_limit,w_1200,h_1200,f_jpg,q_auto/");
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

export const buildRegistrationShareMeta = (event, identifier, req = null) => {
  const siteUrl = getSiteUrl();
  const eventId = event?._id?.toString() || identifier;
  const pageUrl = getRegistrationUrl(eventId);
  
  const title = event?.title
    ? `${event.title} | Registration`
    : "Event Registration";
  
  const description = event?.description
    ? truncateDescription(
        `Register for ${event.title}. ${event.description}`,
      )
    : DEFAULT_DESCRIPTION;
    
  const image = getOgImageUrl(event?.banner, siteUrl);
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    siteName: SITE_NAME,
    title: fullTitle,
    shortTitle: title,
    description,
    pageUrl,
    shareUrl: pageUrl,
    image,
    type: "website",
  };
};

export const buildMetaTagsHtml = (meta) => {
  const {
    siteName,
    title,
    description,
    pageUrl,
    shareUrl,
    image,
    type = "website",
  } = meta;

  const finalUrl = shareUrl || pageUrl;

  return [
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(finalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="1200" />`,
    `<meta property="og:image:alt" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(title)}" />`,
  ].join("\n  ");
};

export const injectMetaIntoHtml = (html, meta) => {
  const metaTagsHtml = buildMetaTagsHtml(meta);
  let result = html;

  result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  result = result.replace(
    /<meta name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );

  result = result.replace(/\s*<meta property="og:[^"]+"[^>]*\/?>\n?/g, "");
  result = result.replace(/\s*<meta name="twitter:[^"]+"[^>]*\/?>\n?/g, "");
  result = result.replace(/\s*<link rel="canonical"[^>]*\/?>\n?/g, "");

  const injection = [
    metaTagsHtml,
    `<link rel="canonical" href="${escapeHtml(meta.pageUrl)}" />`,
  ].join("\n  ");

  return result.replace("</head>", `  ${injection}\n</head>`);
};
