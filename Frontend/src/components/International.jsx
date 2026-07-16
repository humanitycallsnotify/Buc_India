import React, { useEffect, useState } from "react";
import { Globe, Shield, Zap, ArrowRight } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { internationalProfileService } from "../services/api";
import ProfileContentModal, { SocialLinks } from "./ProfileContentModal";

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

const International = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await internationalProfileService.getPublic();
        setProfiles(data || []);
      } catch (error) {
        console.error("Failed to load international profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-carbon text-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24">
          <span className="text-copper font-body tracking-[0.5em] text-xs uppercase mb-4 block font-bold">Global Presence</span>
          <h1 className="font-heading text-6xl md:text-9xl uppercase leading-none mb-8">
            Beyond <span className="text-copper">Borders</span>
          </h1>
          <p className="font-text text-steel-dim text-lg md:text-xl max-w-2xl">
            BUC India is expanding its horizon. Join the elite global network of riders who push limits and redefine brotherhood across continents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          <div className="p-10 border border-white/5 bg-carbon-light relative group hover:border-copper/30 transition-all duration-500">
            <Globe className="text-copper mb-8 group-hover:scale-110 transition-transform duration-500" size={40} />
            <h3 className="font-heading text-3xl uppercase mb-4">Global Network</h3>
            <p className="font-text text-steel-dim text-sm leading-relaxed">
              Connect with international chapters and experience the thrill of riding in diverse terrains across the globe.
            </p>
          </div>
          <div className="p-10 border border-white/5 bg-carbon-light relative group hover:border-copper/30 transition-all duration-500">
            <Shield className="text-copper mb-8 group-hover:scale-110 transition-transform duration-500" size={40} />
            <h3 className="font-heading text-3xl uppercase mb-4">Cross-Border Support</h3>
            <p className="font-text text-steel-dim text-sm leading-relaxed">
              Our global logistics and support network ensures you&apos;re never alone, no matter where your adventure takes you.
            </p>
          </div>
          <div className="p-10 border border-white/5 bg-carbon-light relative group hover:border-copper/30 transition-all duration-500">
            <Zap className="text-copper mb-8 group-hover:scale-110 transition-transform duration-500" size={40} />
            <h3 className="font-heading text-3xl uppercase mb-4">International Rallies</h3>
            <p className="font-text text-steel-dim text-sm leading-relaxed">
              Exclusive early access to world-renowned motorcycle rallies and events for our premium global members.
            </p>
          </div>
        </div>

        {/* International Profiles */}
        <div className="mb-32">
          <div className="mb-12">
            <span className="text-copper font-body tracking-[0.5em] text-xs uppercase mb-4 block font-bold">Global Leaders</span>
            <h2 className="font-heading text-5xl md:text-7xl uppercase leading-none">
              International <span className="text-copper">Profiles</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-12 border border-dashed border-white/10 text-center">
              <p className="font-body text-steel-dim text-sm uppercase tracking-widest">Profiles coming soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles.map((profile) => (
                <article
                  key={profile._id}
                  className="group flex flex-col p-6 border border-white/5 bg-carbon-light hover:border-copper/30 transition-all duration-500"
                >
                  <div className="aspect-square mb-6 overflow-hidden border border-white/10">
                    <img
                      src={profile.profilePhoto || "/logo.jpg"}
                      alt={profile.fullName}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {profile.country && countryNameToCode(profile.country) && (
                      <ReactCountryFlag
                        countryCode={countryNameToCode(profile.country)}
                        svg
                        style={{
                          width: '1.2em',
                          height: '1.2em',
                        }}
                        title={getCountryName(profile.country)}
                      />
                    )}
                    {profile.country && (
                      <span className="text-copper font-body text-[10px] tracking-[0.3em] uppercase block mr-1">
                        {getCountryName(profile.country)}
                      </span>
                    )}

                    {profile.visitedCountries && profile.visitedCountries.length > 0 && (
                      <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                        {profile.visitedCountries.map((cCode) => (
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
                  <h3 className="font-heading text-2xl uppercase text-white group-hover:text-copper transition-colors mb-2">
                    {profile.fullName}
                  </h3>
                  {profile.designation && (
                    <p className="font-body text-[10px] text-steel-dim uppercase tracking-widest mb-3">
                      {profile.designation}
                    </p>
                  )}
                  {profile.shortBio && (
                    <p className="font-text text-steel-dim text-sm line-clamp-3 mb-4 flex-grow">
                      {profile.shortBio}
                    </p>
                  )}
                  <SocialLinks item={profile} className="mb-5" />
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(profile)}
                    className="w-full py-3 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon hover:border-copper transition-all duration-300"
                  >
                    Read More
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="relative h-[60vh] flex items-center justify-center overflow-hidden border border-white/5 group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center grayscale opacity-30 group-hover:scale-105 transition-transform duration-700"></div>
          <div className="absolute inset-0 bg-carbon/60 backdrop-blur-[2px]"></div>

          <div className="relative z-10 text-center px-6">
            <h2 className="font-heading text-4xl md:text-6xl uppercase mb-8">Ready to go <span className="text-copper">Global?</span></h2>
            <button className="bg-copper text-carbon px-12 py-5 font-heading text-xl uppercase hover:bg-white transition-all duration-500 flex items-center gap-4 mx-auto group/btn">
              Enquire for International Chapter
              <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <ProfileContentModal
        item={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        nameField="fullName"
      />
    </div>
  );
};

export default International;

