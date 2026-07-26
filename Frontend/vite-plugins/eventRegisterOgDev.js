const DEFAULT_API_BASE = "http://localhost:5000";

function getApiBase() {
  const configured = process.env.VITE_API_URL || process.env.API_URL;
  if (!configured) return DEFAULT_API_BASE;
  return configured.replace(/\/api\/?$/, "");
}

export function eventRegisterOgDevPlugin() {
  return {
    name: "event-register-og-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = req.originalUrl || req.url || "";
        const match = requestUrl.match(/^\/event-register\/([^/?#]+)/);
        if (!match || req.method !== "GET") {
          return next();
        }

        try {
          const apiBase = getApiBase();
          const response = await fetch(
            `${apiBase}/og/event-register/${encodeURIComponent(match[1])}`,
          );

          if (response.ok) {
            const html = await response.text();
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
            return;
          }
        } catch (error) {
          console.warn("[og-dev] Falling back to SPA index:", error.message);
        }

        next();
      });
    },
  };
}
