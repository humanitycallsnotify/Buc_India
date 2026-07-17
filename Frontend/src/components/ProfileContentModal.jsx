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
  if (!item) return null;

  const name = item[nameField] || item.fullName || item.name;
  const subtitle = item.designation || item.organization;
  const location = item.country;
  const shortText = item.shortBio || item.shortDescription;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-carbon/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-carbon-light border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center border border-white/10 hover:border-copper/40 hover:text-copper transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-5 gap-0">
          <div className="md:col-span-2 aspect-square md:aspect-auto bg-carbon">
            {item.profilePhoto ? (
              <img
                src={item.profilePhoto}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full min-h-[200px] flex items-center justify-center text-steel-dim font-body text-xs uppercase tracking-widest">
                No Photo
              </div>
            )}
          </div>

          <div className="md:col-span-3 p-8 md:p-10">
            {(location || (item.visitedCountries && item.visitedCountries.length > 0)) && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {location && countryNameToCode(location) && (
                  <ReactCountryFlag
                    countryCode={countryNameToCode(location)}
                    svg
                    style={{
                      width: '1.2em',
                      height: '1.2em',
                    }}
                    title={getCountryName(location)}
                  />
                )}
                {location && (
                  <span className="text-copper font-body text-[10px] tracking-[0.3em] uppercase block">
                    {getCountryName(location)}
                  </span>
                )}
                
                {item.visitedCountries && item.visitedCountries.length > 0 && (
                  <div className={`flex items-center gap-1 ${location ? 'border-l border-white/10 pl-2' : ''}`}>
                    <span className="text-steel-dim text-[8px] uppercase tracking-wider mr-1">Visited:</span>
                    {item.visitedCountries.map((cCode) => (
                      <ReactCountryFlag
                        key={cCode}
                        countryCode={cCode}
                        svg
                        style={{
                          width: '1em',
                          height: '1em',
                        }}
                        title={getCountryName(cCode)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            <h3 className="font-heading text-3xl md:text-4xl uppercase text-white mb-2">
              {name}
            </h3>
            {subtitle && (
              <p className="font-body text-sm text-steel-dim uppercase tracking-widest mb-6">
                {[item.designation, item.organization].filter(Boolean).join(" · ")}
              </p>
            )}
            {shortText && (
              <p className="font-text text-steel-dim text-sm leading-relaxed mb-6 border-l-2 border-copper/30 pl-4">
                {shortText}
              </p>
            )}
            {item.fullArticle && (
              <div className="font-text text-steel-dim text-sm leading-relaxed whitespace-pre-wrap mb-8">
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
