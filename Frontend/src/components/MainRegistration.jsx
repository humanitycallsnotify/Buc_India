import React, { useState } from "react";
import UserRegistrationForm from "./UserRegistrationForm";
import TalentRegistrationForm from "./TalentRegistrationForm";
import ClubCollaborate from "./Clubs/ClubCollaborate";
import { User, Shield, Star, Heart, ArrowRight } from "lucide-react";
import { galleryService } from "../services/api";

const MainRegistration = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [coverPhoto, setCoverPhoto] = useState(null);

  React.useEffect(() => {
    const fetchCover = async () => {
      try {
        const items = await galleryService.getAll();
        const coverItem = items.find(item => item.category === 'cover');
        if (coverItem) {
          setCoverPhoto(coverItem.imageUrl);
        }
      } catch (err) {
        console.error("Failed to fetch cover photo:", err);
      }
    };
    fetchCover();
  }, []);

  return (
    <div 
      className="min-h-screen bg-carbon text-white relative"
      style={coverPhoto ? {
        backgroundImage: `linear-gradient(to bottom, rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.95)), url(${coverPhoto})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* BUC India Brand Top Bar */}
      <div className="w-full bg-carbon-light border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="BUC India" className="w-10 h-10 rounded-full border border-copper/30 object-cover" />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-lg uppercase tracking-widest text-white">BUC India</span>
              <span className="font-body text-[9px] uppercase tracking-[0.25em] text-copper">Bikers Unity Calls</span>
            </div>
          </div>
          <span className="hidden sm:block font-body text-[10px] uppercase tracking-[0.3em] text-steel-dim">
            Registration Portal
          </span>
        </div>
      </div>

      <div className="pt-10 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-7xl uppercase mb-4">
              Registration <span className="text-transparent outline-title">Portal</span>
            </h1>
            <p className="font-text text-steel-dim text-lg max-w-2xl mx-auto leading-relaxed">
              Select the type of registration below. Join as an individual rider, showcase your talent, or partner your club with the network.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:bg-white/5 sm:border sm:border-white/10 sm:p-1 sm:rounded-full w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("user")}
                className={`flex items-center justify-center gap-2 px-2 sm:px-6 py-3 rounded-lg sm:rounded-full font-body text-[9px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
                  activeTab === "user"
                    ? "bg-copper text-carbon font-bold"
                    : "bg-white/5 sm:bg-transparent text-steel-dim hover:text-white hover:bg-white/10 sm:hover:bg-white/5"
                }`}
              >
                <User size={14} className="shrink-0" /> <span className="truncate">User</span>
              </button>
              <button
                onClick={() => setActiveTab("talent")}
                className={`flex items-center justify-center gap-2 px-2 sm:px-6 py-3 rounded-lg sm:rounded-full font-body text-[9px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
                  activeTab === "talent"
                    ? "bg-copper text-carbon font-bold"
                    : "bg-white/5 sm:bg-transparent text-steel-dim hover:text-white hover:bg-white/10 sm:hover:bg-white/5"
                }`}
              >
                <Star size={14} className="shrink-0" /> <span className="truncate">Talent</span>
              </button>
              <button
                onClick={() => setActiveTab("club")}
                className={`flex items-center justify-center gap-2 px-2 sm:px-6 py-3 rounded-lg sm:rounded-full font-body text-[9px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
                  activeTab === "club"
                    ? "bg-copper text-carbon font-bold"
                    : "bg-white/5 sm:bg-transparent text-steel-dim hover:text-white hover:bg-white/10 sm:hover:bg-white/5"
                }`}
              >
                <Shield size={14} className="shrink-0" /> <span className="truncate">Club</span>
              </button>
              <button
                onClick={() => setActiveTab("volunteer")}
                className={`flex items-center justify-center gap-2 px-2 sm:px-6 py-3 rounded-lg sm:rounded-full font-body text-[9px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
                  activeTab === "volunteer"
                    ? "bg-copper text-carbon font-bold"
                    : "bg-white/5 sm:bg-transparent text-steel-dim hover:text-white hover:bg-white/10 sm:hover:bg-white/5"
                }`}
              >
                <Heart size={14} className="shrink-0" /> <span className="truncate">Volunteer</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-all duration-500">
            {activeTab === "user" && (
              <div className="animate-fade-in">
                <UserRegistrationForm />
              </div>
            )}
            {activeTab === "talent" && (
              <div className="animate-fade-in">
                <TalentRegistrationForm />
              </div>
            )}
            {activeTab === "club" && (
              <div className="animate-fade-in -mt-16">
                <ClubCollaborate />
              </div>
            )}
            {activeTab === "volunteer" && (
              <div className="animate-fade-in flex flex-col items-center justify-center py-20 px-6 text-center bg-copper/5 border border-copper/20 shadow-[0_0_15px_rgba(202,138,4,0.1)] rounded-lg">
                <Heart className="text-copper mb-6" size={48} />
                <h2 className="font-heading text-3xl md:text-5xl uppercase mb-6 text-white">Join Humanity Calls</h2>
                <p className="font-text text-steel-dim text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
                  Serving those in need through emergency blood support, uplifting the underprivileged, and protecting our animal companions nationwide.
                </p>
                <a 
                  href="https://www.humanitycalls.org/volunteer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-copper text-carbon font-heading text-lg md:text-xl uppercase hover:bg-white transition-all duration-300"
                >
                  Register as Volunteer <ArrowRight size={20} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainRegistration;
