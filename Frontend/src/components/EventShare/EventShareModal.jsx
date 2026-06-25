import React from "react";
import { motion } from "framer-motion";
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

const ShareBtn = ({ onClick, icon, label, primary = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3 font-body text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm ${
      primary
        ? "bg-copper text-carbon hover:shadow-[0_0_20px_rgba(193,154,107,0.4)]"
        : "border border-copper/40 text-copper hover:bg-copper/10"
    }`}
  >
    {icon}
    {label}
  </button>
);

const EventShareModal = ({ event, onClose, compact = false }) => {
  if (!event) return null;
  const registrationUrl = getEventRegistrationUrl(event._id);
  const qrUrl = getQrCodeUrl(registrationUrl);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-carbon/95 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`relative z-[3001] w-full bg-carbon-light border border-white/10 shadow-2xl overflow-hidden ${
          compact ? "max-w-md" : "max-w-lg"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-steel-dim hover:text-white z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {event.banner && (
          <div className="w-full bg-carbon flex items-center justify-center max-h-48 p-2">
            <img src={event.banner} alt={event.title} className="max-h-44 w-full object-contain" />
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <span className="text-copper font-body text-[10px] uppercase tracking-ultra font-bold">Share Event</span>
            <h3 className="font-heading text-2xl uppercase text-white mt-1">{event.title}</h3>
            {event.eventDate && (
              <p className="font-body text-[10px] text-steel-dim uppercase tracking-widest mt-2">
                {new Date(event.eventDate).toLocaleDateString()} · {event.location || event.meetingPoint || "TBA"}
              </p>
            )}
          </div>

          <div className="bg-carbon border border-white/10 p-4 rounded-sm">
            <p className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-2">Registration Link</p>
            <p className="font-mono text-xs text-copper break-all">{registrationUrl}</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <img src={qrUrl} alt="Registration QR Code" className="w-44 h-44 border border-copper/30 rounded-sm bg-carbon p-2" />
            <button
              type="button"
              onClick={() => downloadQrCode(qrUrl, `${event.slug || event._id}-qr.png`)}
              className="flex items-center gap-2 text-copper font-body text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors"
            >
              <Download size={14} /> Download QR Code
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ShareBtn
              primary
              icon={<Copy size={14} />}
              label="Copy Link"
              onClick={() => copyRegistrationLink(registrationUrl)}
            />
            <ShareBtn
              icon={<ExternalLink size={14} />}
              label="Open Registration"
              onClick={() => openRegistrationLink(registrationUrl)}
            />
            <ShareBtn icon={<MessageCircle size={14} />} label="WhatsApp" onClick={() => shareViaWhatsApp(registrationUrl, event.title)} />
            <ShareBtn icon={<Share2 size={14} />} label="Telegram" onClick={() => shareViaTelegram(registrationUrl, event.title)} />
            <ShareBtn icon={<Share2 size={14} />} label="Facebook" onClick={() => shareViaFacebook(registrationUrl)} />
            <ShareBtn icon={<Share2 size={14} />} label="X" onClick={() => shareViaTwitter(registrationUrl, event.title)} />
            <ShareBtn icon={<Mail size={14} />} label="Email" onClick={() => shareViaEmail(registrationUrl, event.title)} />
            <ShareBtn
              icon={<Share2 size={14} />}
              label="Share"
              onClick={() => nativeShare(registrationUrl, event.title)}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventShareModal;
