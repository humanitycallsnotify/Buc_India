import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  ExternalLink,
  Download,
  Share2,
  Mail,
  MessageCircle,
} from "lucide-react";
import {
  getEventRegistrationUrl,
  getQrCodeUrl,
  copyRegistrationLink,
  openRegistrationLink,
  shareViaWhatsApp,
  shareViaTelegram,
  shareViaFacebook,
  shareViaTwitter,
  shareViaEmail,
  nativeShare,
  downloadQrCode,
} from "../../utils/eventShareUtils";

const ShareBtn = ({ onClick, icon, label, primary = false, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 rounded-lg font-body uppercase tracking-widest font-bold transition-all ${
      compact ? "px-3 py-2.5 text-[9px]" : "px-3 py-2.5 text-[10px]"
    } ${
      primary
        ? "bg-copper text-carbon hover:shadow-[0_0_16px_rgba(193,154,107,0.35)]"
        : "border border-copper/35 text-copper hover:bg-copper/10"
    }`}
  >
    {icon}
    <span className="truncate">{label}</span>
  </button>
);

const EventShareModal = ({ event, onClose }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!event) return null;

  const registrationUrl = getEventRegistrationUrl(event._id);
  const qrUrl = getQrCodeUrl(registrationUrl, 160);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6">
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-default"
          onClick={onClose}
          aria-label="Close share dialog"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-share-title"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative z-[3001] w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md rounded-t-2xl">
            <div>
              <span className="text-copper font-body text-[9px] uppercase tracking-ultra font-bold">Share Event</span>
              <h3 id="event-share-title" className="font-heading text-lg uppercase text-white leading-tight mt-0.5 line-clamp-2">
                {event.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 ml-3 p-2 rounded-lg text-steel-dim hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {event.banner && (
            <div className="px-5 pt-4">
              <div className="rounded-xl overflow-hidden bg-carbon border border-white/5 flex items-center justify-center max-h-36">
                <img src={event.banner} alt={event.title} className="w-full max-h-36 object-contain" />
              </div>
            </div>
          )}

          <div className="p-5 space-y-4">
            {event.eventDate && (
              <p className="font-body text-[10px] text-steel-dim uppercase tracking-widest">
                {new Date(event.eventDate).toLocaleDateString()} · {event.location || event.meetingPoint || "TBA"}
              </p>
            )}

            <div className="rounded-xl bg-carbon border border-white/10 p-3">
              <p className="font-body text-[9px] uppercase tracking-widest text-steel-dim mb-1.5">Registration Link</p>
              <p className="font-mono text-[11px] text-copper break-all leading-relaxed">{registrationUrl}</p>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-carbon/60 border border-white/5 p-3">
              <img
                src={qrUrl}
                alt="Registration QR Code"
                className="w-28 h-28 shrink-0 rounded-lg border border-copper/25 bg-carbon p-1.5"
              />
              <div className="flex flex-col gap-2 min-w-0">
                <p className="font-body text-[10px] text-steel-dim uppercase tracking-widest">Scan to register</p>
                <button
                  type="button"
                  onClick={() => downloadQrCode(qrUrl, `${event.slug || event._id}-qr.png`)}
                  className="inline-flex items-center gap-1.5 text-copper font-body text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors w-fit"
                >
                  <Download size={13} /> Download QR
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ShareBtn
                primary
                compact
                icon={<Copy size={13} />}
                label="Copy Link"
                onClick={() => copyRegistrationLink(registrationUrl)}
              />
              <ShareBtn
                compact
                icon={<ExternalLink size={13} />}
                label="Open Registration"
                onClick={() => openRegistrationLink(registrationUrl)}
              />
              <ShareBtn compact icon={<MessageCircle size={13} />} label="WhatsApp" onClick={() => shareViaWhatsApp(registrationUrl, event.title)} />
              <ShareBtn compact icon={<Share2 size={13} />} label="Telegram" onClick={() => shareViaTelegram(registrationUrl, event.title)} />
              <ShareBtn compact icon={<Share2 size={13} />} label="Facebook" onClick={() => shareViaFacebook(registrationUrl)} />
              <ShareBtn compact icon={<Share2 size={13} />} label="X" onClick={() => shareViaTwitter(registrationUrl, event.title)} />
              <ShareBtn compact icon={<Mail size={13} />} label="Email" onClick={() => shareViaEmail(registrationUrl, event.title)} />
              <ShareBtn
                compact
                icon={<Share2 size={13} />}
                label="Share"
                onClick={() => nativeShare(registrationUrl, event.title)}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventShareModal;
