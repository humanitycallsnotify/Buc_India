import React, { useEffect } from "react";
import { X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TermsModal = ({
  isOpen,
  onClose,
  title,
  subtitle = "Declaration & Agreement",
  introText = "By registering, I hereby acknowledge, agree, and declare the following:",
  terms = [],
  finalAcceptanceTitle = "✍️ Final Acceptance",
  finalAcceptanceItems = [],
  onAccept,
  acceptButtonText = "I Accept & Agree"
}) => {
  // Prevent background scrolling for standard browsers
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Add a class to indicate lenis should stop if applicable
      document.documentElement.classList.add("lenis-stopped");
    } else {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-carbon/90 backdrop-blur-md cursor-pointer"
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl bg-carbon-light border border-white/10 p-6 md:p-10 text-white z-10 max-h-[85vh] flex flex-col shadow-copper-glow"
          >
            {/* Close Trigger */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-6 right-6 text-steel-dim hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-copper/10 border border-copper/30 flex items-center justify-center rounded-full">
                <Shield className="text-copper" size={24} />
              </div>
              <div>
                <span className="text-copper font-body text-[10px] tracking-widest uppercase block">{subtitle}</span>
                <h3 className="font-heading text-3xl uppercase">{title}</h3>
              </div>
            </div>
            
            {/* 
              Scrollable Terms area.
              data-lenis-prevent is critical here! 
              It tells Lenis smooth scroll to contain events inside this container and stop scrolling the background page.
            */}
            <div 
              data-lenis-prevent
              className="flex-1 overflow-y-auto pr-3 space-y-6 font-text text-sm text-steel-dim leading-relaxed border-y border-white/10 py-6 my-4 max-h-[50vh] overscroll-contain"
            >
              <p className="font-semibold text-white">
                {introText}
              </p>
              
              <div className="space-y-4">
                {terms.map((term, index) => (
                  <div key={index} className="p-5 bg-carbon/40 border border-white/5 rounded-small hover:border-copper/20 transition-all duration-300">
                    <h4 className="font-subheading text-lg text-copper uppercase mb-2">{term.title}</h4>
                    <p className="whitespace-pre-line text-xs font-body tracking-wider text-steel/80 leading-relaxed">{term.content}</p>
                  </div>
                ))}
              </div>
              
              {finalAcceptanceItems && finalAcceptanceItems.length > 0 && (
                <div className="p-5 bg-copper/5 border border-copper/20 rounded-small">
                  <h4 className="font-subheading text-lg text-copper uppercase mb-2">{finalAcceptanceTitle}</h4>
                  <ul className="list-disc list-inside space-y-2 text-xs font-body tracking-wider text-white">
                    {finalAcceptanceItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Footer buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-white/10 hover:bg-white/5 font-body text-xs uppercase tracking-widest transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="px-8 py-3 bg-copper hover:bg-white text-carbon font-body text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-copper/20"
              >
                {acceptButtonText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;
