import { useEffect } from "react";
import { buildRegistrationShareMeta } from "../utils/registrationShareMeta.js";

const upsertMeta = (selectorAttr, selectorValue, content, propertyAttr = "content") => {
  let element = document.querySelector(`meta[${selectorAttr}="${selectorValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(selectorAttr, selectorValue);
    document.head.appendChild(element);
  }
  element.setAttribute(propertyAttr, content);
};

const upsertLink = (rel, href) => {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

export const useRegistrationShareMeta = (event, eventId) => {
  useEffect(() => {
    const meta = buildRegistrationShareMeta(event, eventId);

    document.title = meta.title;
    upsertMeta("name", "description", meta.description);

    upsertMeta("property", "og:site_name", meta.siteName);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:url", meta.pageUrl);
    upsertMeta("property", "og:image", meta.image);
    upsertMeta("property", "og:image:secure_url", meta.image);
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");
    upsertMeta("property", "og:image:alt", meta.title);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);
    upsertMeta("name", "twitter:image", meta.image);
    upsertMeta("name", "twitter:image:alt", meta.title);

    upsertLink("canonical", meta.pageUrl);
  }, [event, eventId]);
};

export default useRegistrationShareMeta;
