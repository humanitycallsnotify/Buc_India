import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactCountryFlag from "react-country-flag";
import { partnerService, internationalProfileService } from "../services/api";

const countryNameToCode = (countryName) => {
  if (!countryName) return "";
  const name = countryName.trim().toLowerCase();
  if (name.length === 2) return name.toUpperCase();
  
  const map = {
    india: "IN",
    "united states": "US",
    "united states of america": "US",
    usa: "US",
    "united kingdom": "GB",
    uk: "GB",
    "united arab emirates": "AE",
    uae: "AE",
    singapore: "SG",
    australia: "AU",
    canada: "CA",
    germany: "DE",
    france: "FR",
    italy: "IT",
    spain: "ES",
    japan: "JP",
    china: "CN",
    brazil: "BR",
    russia: "RU",
    "south africa": "ZA",
    netherlands: "NL",
    switzerland: "CH",
    sweden: "SE",
    norway: "NO",
    denmark: "DK",
    finland: "FI",
    "new zealand": "NZ",
    malaysia: "MY",
    thailand: "TH",
    indonesia: "ID",
    philippines: "PH",
    vietnam: "VN",
  };
  return map[name] || "";
};

const PartnerMarquee = () => {
  const [partners, setPartners] = useState([]);
  const [internationalRiders, setInternationalRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partnersData] = await Promise.all([
          partnerService.getAll()
        ]);
        setPartners(partnersData || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || partners.length === 0) return null;

  // Duplicate the partners array to create a seamless infinite loop
  const displayPartners = [...partners, ...partners];

  return (
    <div className="w-full py-20 bg-carbon overflow-hidden border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase block font-bold mb-2">Our Network</span>
        <h3 className="font-heading text-4xl text-white uppercase tracking-wider">Trusted <span className="text-copper">Partners</span></h3>
      </div>

      {/* Atmospheric Gradients for fading edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-carbon to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-carbon to-transparent z-10 pointer-events-none"></div>

      <div className="relative flex overflow-x-hidden">
        <motion.div
          className="flex whitespace-nowrap gap-16 md:gap-32 px-8 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: Math.max(partners.length * 3, 20), // Speed based on item count
            repeat: Infinity,
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {displayPartners.map((partner, i) => (
            <div 
              key={`${partner._id}-${i}`} 
              className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
            >
              <img 
                src={partner.imageUrl} 
                alt={partner.name || "Partner"} 
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>

    </div>
  );
};

export default PartnerMarquee;
