import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Globe, ChevronLeft, ChevronRight } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { internationalProfileService } from "../services/api";
import ProfileContentModal from "./ProfileContentModal";
import { motion, AnimatePresence } from "framer-motion";

const InternationalRidersCarousel = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const data = await internationalProfileService.getAll();
        const activeRiders = data.filter(r => r.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
        setRiders(activeRiders);
      } catch (error) {
        console.error("Failed to load international riders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-carbon">
        <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!riders || riders.length === 0) {
    return null;
  }

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % riders.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + riders.length) % riders.length);

  return (
    <section className="relative py-24 bg-carbon overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-12">
        <h2 className="font-heading text-3xl md:text-5xl lg:text-5xl text-white uppercase tracking-tight mb-4">
          Global Brotherhood <br />
          <span className="text-copper">International Riders</span>
        </h2>
      </div>

      <div className="relative w-full max-w-[1200px] mx-auto h-[350px] md:h-[500px] flex items-center justify-center">
        {riders.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-4 md:left-10 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-carbon/80 border border-white/10 flex items-center justify-center text-white hover:text-copper hover:border-copper/50 transition-colors backdrop-blur-sm">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} className="absolute right-4 md:right-10 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-carbon/80 border border-white/10 flex items-center justify-center text-white hover:text-copper hover:border-copper/50 transition-colors backdrop-blur-sm">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
          {riders.map((rider, index) => {
            let diff = index - activeIndex;
            if (diff > riders.length / 2) diff -= riders.length;
            if (diff < -riders.length / 2) diff += riders.length;

            const isCenter = diff === 0;
            const isLeft = diff === -1;
            const isRight = diff === 1;
            const isVisible = Math.abs(diff) <= 1;

            const offset = isMobile ? 180 : 350;

            return (
              <motion.div
                key={rider._id || index}
                className={`absolute w-[260px] h-[330px] md:w-[450px] md:h-[500px] rounded-[32px] overflow-hidden cursor-pointer ${isVisible ? "pointer-events-auto" : "pointer-events-none"}`}
                initial={false}
                animate={{
                  x: diff * offset,
                  scale: isCenter ? 1 : 0.85,
                  opacity: isCenter ? 1 : (isVisible ? 0.3 : 0),
                  zIndex: isCenter ? 20 : 10,
                  filter: isCenter ? "blur(0px)" : "blur(8px)",
                }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                onClick={() => {
                  if (isCenter) setSelectedRider(rider);
                  else if (isLeft) handlePrev();
                  else if (isRight) handleNext();
                }}
              >
                <img 
                  src={rider.profilePhoto || "https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=2070&auto=format&fit=crop"} 
                  alt={rider.fullName}
                  className="w-full h-full object-cover rounded-[32px] border border-white/10 shadow-2xl"
                />
                
                {/* Optional overlay for center item */}
                <div className={`absolute inset-0 bg-gradient-to-t from-carbon/80 via-transparent to-transparent transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute bottom-6 left-0 right-0 text-center flex justify-center items-center">
                     <span className="bg-copper/90 text-white font-body text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                       View Profile
                     </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-12 px-4">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <span className="font-body text-xs md:text-sm text-steel-dim uppercase tracking-[0.2em] mb-2 block">
            {riders[activeIndex]?.designation || "International Rider"}
          </span>
          <h3 className="font-heading text-3xl md:text-5xl text-white uppercase tracking-wider mb-6">
            {riders[activeIndex]?.fullName}
          </h3>
          <div className="flex items-center gap-3 justify-center flex-wrap">
            {riders[activeIndex]?.country && (
              <div className="flex items-center gap-2 bg-copper/10 px-4 py-2 border border-copper/30 rounded-full">
                <ReactCountryFlag countryCode={riders[activeIndex]?.country} svg style={{ width: '1.4em', height: '1.4em' }} />
                <span className="text-[10px] uppercase text-white font-body tracking-widest">Home</span>
              </div>
            )}
            {riders[activeIndex]?.visitedCountries?.length > 0 && (
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 border border-white/10 rounded-full">
                <span className="text-steel-dim text-[10px] uppercase tracking-widest">Visited</span>
                <div className="flex gap-1 items-center">
                  {riders[activeIndex]?.visitedCountries.map(cCode => (
                    <ReactCountryFlag key={cCode} countryCode={cCode} svg style={{ width: '1.4em', height: '1.4em' }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {riders.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {riders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? "w-8 bg-copper" : "w-2 bg-white/20 hover:bg-white/40"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRider && (
        <ProfileContentModal 
          item={selectedRider} 
          onClose={() => setSelectedRider(null)} 
          type="international" 
        />
      )}
    </section>
  );
};

export default InternationalRidersCarousel;
