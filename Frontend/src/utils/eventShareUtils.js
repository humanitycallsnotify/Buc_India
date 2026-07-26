import { toast } from "react-toastify";

export const getEventRegistrationUrl = (eventId) => {
  if (!eventId) return "";
  const siteUrl = window.location.origin;
  return `${siteUrl}/event-register/${eventId}`;
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

export const buildShareMessage = (event, url) => {
  const title = event?.title || "BUC India Event";
  let dateStr = "";
  let timeStr = "";
  
  if (event?.eventDate) {
    const d = new Date(event.eventDate);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
  }
  
  const location = event?.location || event?.meetingPoint || "";
  const description = event?.description || "";
  
  const parts = [];
  parts.push(`🚴 ${title}`);
  parts.push("");
  if (dateStr) parts.push(`📅 ${dateStr}`);
  if (timeStr) parts.push(`🕕 ${timeStr}`);
  if (location) parts.push(`📍 ${location}`);
  
  if (dateStr || timeStr || location) {
    parts.push("");
  }
  
  if (description) {
    parts.push(description);
    parts.push("");
  }
  
  if (url) {
    parts.push("Register here:");
    parts.push(url);
  } else {
    parts.push("Register here:");
  }
  
  return parts.join("\n");
};

export const shareViaWhatsApp = (url, event) => {
  const text = encodeURIComponent(buildShareMessage(event, url));
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
};

export const shareViaTelegram = (url, event) => {
  const text = encodeURIComponent(buildShareMessage(event, ""));
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, "_blank", "noopener,noreferrer");
};

export const shareViaFacebook = (url) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
};

export const shareViaTwitter = (url, event) => {
  const text = encodeURIComponent(buildShareMessage(event, ""));
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, "_blank", "noopener,noreferrer");
};

export const shareViaEmail = (url, event) => {
  const subject = encodeURIComponent(event?.title || "BUC India Event");
  const body = encodeURIComponent(buildShareMessage(event, url));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

export const nativeShare = async (url, event) => {
  if (navigator.share) {
    try {
      const shareData = {
        title: event?.title || "BUC India Event",
        text: buildShareMessage(event, url),
      };

      if (event?.banner && navigator.canShare) {
        try {
          const response = await fetch(event.banner);
          const blob = await response.blob();
          const file = new File([blob], 'event-poster.jpg', { type: blob.type || 'image/jpeg' });
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (e) {
          console.warn("Could not fetch banner for native share", e);
        }
      }

      await navigator.share(shareData);
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
