const DEFAULT_API_BASE = "https://api-buc-india.onrender.com";

const getApiBase = () => {
  const configured = process.env.API_URL || process.env.VITE_API_URL;
  if (!configured) return DEFAULT_API_BASE;
  return configured.replace(/\/api\/?$/, "");
};

export default async (req) => {
  const requestUrl = new URL(req.url);
  const segments = requestUrl.pathname.split("/").filter(Boolean);
  const identifier = segments[segments.length - 1] || "";

  if (!identifier) {
    return new Response("Missing event identifier.", { status: 400 });
  }

  try {
    const apiBase = getApiBase();
    const response = await fetch(
      `${apiBase}/og/event-register/${encodeURIComponent(identifier)}`,
    );
    const html = await response.text();

    return new Response(html, {
      status: response.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (error) {
    return new Response("Unable to render registration preview page.", {
      status: 500,
    });
  }
};
