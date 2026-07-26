const SITE_NAME = "Bikers Unity Calls";
const DEFAULT_SITE_URL = "https://bucindia.com";

export const getSiteUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL;
};

export const getRegistrationUrl = (eventId) =>
  `${getSiteUrl()}/event-register/${eventId}`;

export const truncateDescription = (value = "", maxLength = 200) => {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
};

export const getOgImageUrl = (bannerUrl) => {
  const siteUrl = getSiteUrl();
  const fallback = `${siteUrl}/background-bikers.jpg`;

  if (!bannerUrl || !String(bannerUrl).trim()) {
    return fallback;
  }

  const url = String(bannerUrl).trim();

  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("/upload/c_fill,w_1200,h_630")) {
      return url;
    }
    return url.replace("/upload/", "/upload/c_fill,w_1200,h_630,f_jpg,q_auto/");
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

export const buildRegistrationShareMeta = (event, identifier) => {
  const eventId = event?._id?.toString() || identifier;
  const pageUrl = getRegistrationUrl(eventId);
  const title = event?.title
    ? `${event.title} | Registration`
    : "Event Registration";
  const description = event?.description
    ? truncateDescription(`Register for ${event.title}. ${event.description}`)
    : "Register for BUC India motorcycle events, group rides, and touring adventures across India.";
  const image = getOgImageUrl(event?.banner);
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    siteName: SITE_NAME,
    title: fullTitle,
    description,
    pageUrl,
    image,
  };
};
