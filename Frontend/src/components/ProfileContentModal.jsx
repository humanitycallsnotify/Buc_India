import React, { useEffect } from "react";
import { Instagram, Facebook, Twitter, Globe, Linkedin, Youtube, X } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

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

const getCountryName = (codeOrName) => {
  if (!codeOrName) return "";
  if (codeOrName.length !== 2) return codeOrName;
  const map = {
    IN: "India",
    US: "United States",
    GB: "United Kingdom",
    AE: "United Arab Emirates",
    SG: "Singapore",
    AU: "Australia",
    CA: "Canada",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    JP: "Japan",
    CN: "China",
    BR: "Brazil",
    RU: "Russia",
    ZA: "South Africa",
    NL: "Netherlands",
    CH: "Switzerland",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    NZ: "New Zealand",
    MY: "Malaysia",
    TH: "Thailand",
    ID: "Indonesia",
    PH: "Philippines",
    VN: "Vietnam",
  };
  return map[codeOrName.toUpperCase()] || codeOrName;
};

const SOCIAL_CONFIG = {
  instagramUrl: { Icon: Instagram, label: "Instagram" },
  facebookUrl: { Icon: Facebook, label: "Facebook" },
  twitterUrl: { Icon: Twitter, label: "Twitter/X" },
  websiteUrl: { Icon: Globe, label: "Website" },
  linkedInUrl: { Icon: Linkedin, label: "LinkedIn" },
  youtubeUrl: { Icon: Youtube, label: "YouTube" },
};

export const SocialLinks = ({ item, className = "" }) => {
  const links = Object.entries(SOCIAL_CONFIG).filter(
    ([key]) => item?.[key]?.trim(),
  );

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.map(([key, { Icon, label }]) => (
        <a
          key={key}
          href={item[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="w-10 h-10 border border-white/10 flex items-center justify-center rounded-sm bg-carbon/30 hover:bg-copper/10 hover:border-copper/40 transition-colors duration-200"
        >
          <Icon size={18} className="text-white/60 hover:text-copper" />
        </a>
      ))}
    </div>
  );
};

const ProfileContentModal = ({ item, onClose, nameField = "fullName" }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!item) return null;

  const name = item[nameField] || item.fullName || item.name;
  const subtitle = item.designation || item.organization;
  const location = item.country;
  const shortText = item.shortBio || item.shortDescription;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-carbon"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-carbon"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-[3010] w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-copper hover:text-black text-white border border-white/10 rounded-full transition-all backdrop-blur-md"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Left Side: Image */}
        <div className="w-full h-[40vh] md:h-full md:w-1/2 relative bg-black">
          {item.profilePhoto ? (
            <>
              <img
                src={item.profilePhoto}
                alt={name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent md:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-carbon hidden md:block"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-steel-dim font-body text-sm uppercase tracking-widest">
              No Photo
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="w-full h-[60vh] md:h-full md:w-1/2 overflow-y-auto px-6 py-8 md:p-16 lg:p-24" data-lenis-prevent="true">
          <div className="max-w-2xl mx-auto">
            {(location || (item.visitedCountries && item.visitedCountries.length > 0)) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {location && countryNameToCode(location) && (
                  <ReactCountryFlag
                    countryCode={countryNameToCode(location)}
                    svg
                    style={{ width: '1.4em', height: '1.4em' }}
                    title={getCountryName(location)}
                  />
                )}
                {location && (
                  <span className="text-copper font-body text-xs tracking-[0.3em] uppercase block">
                    {getCountryName(location)}
                  </span>
                )}
                
                {item.visitedCountries && item.visitedCountries.length > 0 && (
                  <div className={`flex items-center gap-1.5 ${location ? 'border-l border-white/10 pl-3 ml-1' : ''}`}>
                    <span className="text-steel-dim text-[9px] uppercase tracking-wider mr-1">Visited:</span>
                    {item.visitedCountries.map((cCode) => (
                      <ReactCountryFlag
                        key={cCode}
                        countryCode={cCode}
                        svg
                        style={{ width: '1.2em', height: '1.2em' }}
                        title={getCountryName(cCode)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            <h3 className="font-heading text-4xl md:text-5xl lg:text-6xl uppercase text-white mb-2 leading-none">
              {name}
            </h3>
            <div className="w-24 h-1 bg-copper mb-6"></div>
            
            {subtitle && (
              <p className="font-body text-sm md:text-base text-steel-dim uppercase tracking-[0.2em] mb-10">
                {[item.designation, item.organization].filter(Boolean).join(" · ")}
              </p>
            )}
            
            {shortText && (
              <p className="font-text text-steel-dim text-base md:text-lg leading-relaxed mb-8 border-l-2 border-copper/50 pl-5">
                {shortText}
              </p>
            )}
            
            {item.fullArticle && (
              <div className="font-text text-steel-dim/90 text-sm md:text-base leading-loose whitespace-pre-wrap mb-12">
                {item.fullArticle}
              </div>
            )}
            
            <SocialLinks item={item} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContentModal;
