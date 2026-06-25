import { toast } from "react-toastify";

export const getEventRegistrationUrl = (eventId) => {
  if (!eventId) return "";
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/event-register/${eventId}`;
};

export const getQrCodeUrl = (registrationUrl, size = 220) => {
  if (!registrationUrl) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(registrationUrl)}&bgcolor=0a0a0a&color=C19A6B`;
};

export const copyRegistrationLink = async (url, message = "Registration link copied successfully.") => {
  if (!url) return false;
  try {
    await navigator.clipboard.writeText(url);
    toast.success(message);
    return true;
  } catch {
    toast.error("Failed to copy link.");
    return false;
  }
};

export const openRegistrationLink = (url) => {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};

export const shareViaWhatsApp = (url, title) => {
  const text = encodeURIComponent(`Join ${title || "this BUC India event"}! Register here: ${url}`);
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
};

export const shareViaTelegram = (url, title) => {
  const text = encodeURIComponent(`${title || "BUC India Event"} — Register: ${url}`);
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, "_blank", "noopener,noreferrer");
};

export const shareViaFacebook = (url) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
};

export const shareViaTwitter = (url, title) => {
  const text = encodeURIComponent(`${title || "BUC India Event"} — Register now`);
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, "_blank", "noopener,noreferrer");
};

export const shareViaEmail = (url, title) => {
  const subject = encodeURIComponent(`Register for ${title || "BUC India Event"}`);
  const body = encodeURIComponent(`Register for this event:\n\n${url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

export const nativeShare = async (url, title, text) => {
  if (navigator.share) {
    try {
      await navigator.share({ title: title || "BUC India Event", text: text || "Register for this event", url });
      return true;
    } catch (err) {
      if (err?.name !== "AbortError") toast.error("Share failed.");
      return false;
    }
  }
  return copyRegistrationLink(url);
};

export const downloadQrCode = async (qrUrl, filename = "event-registration-qr.png") => {
  try {
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("QR code downloaded.");
  } catch {
    toast.error("Failed to download QR code.");
  }
};

export const getRegistrationStatusLabel = (event) => {
  const settings = event?.registrationSettings || {};
  const now = new Date();
  const open = parseLocalDateOnly(settings.registrationOpenDate);
  const close = parseLocalDateOnly(settings.registrationCloseDate);
  if (close) {
    const end = new Date(close);
    end.setHours(23, 59, 59, 999);
    if (now > end) return "Closed";
  }
  if (open && now < open) return "Opens Soon";
  const cap = Number(settings.capacity);
  if (Number.isFinite(cap) && cap > 0) {
    const remaining = cap - (event.registrationCount || 0);
    if (remaining <= 0) return "Full";
  }
  return "Open";
};

export const parseLocalDateOnly = (dateStr) => {
  if (!dateStr || !String(dateStr).trim()) return null;
  const part = String(dateStr).split("T")[0];
  const [y, m, d] = part.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
