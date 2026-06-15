import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import UserRegistrationForm from "./UserRegistrationForm";
import TalentRegistrationForm from "./TalentRegistrationForm";
import ClubCollaborate from "./Clubs/ClubCollaborate";
import { User, Shield, Star, Heart, Calendar, ArrowRight } from "lucide-react";
import { galleryService, eventService } from "../services/api";

const MainRegistration = () => {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState("user");
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [event, setEvent] = useState(null);

  const loadEventAndCover = useCallback(async () => {
    // 1. Fetch general cover photo
    try {
      const items = await galleryService.getAll();
      const coverItem = items.find(item => item.category === 'cover');
      if (coverItem) {
        setCoverPhoto(coverItem.imageUrl);
      }
    } catch (err) {
      console.error("Failed to fetch default cover photo:", err);
    }

    // 2. Fetch event by slug if slug is provided
    const currentSlug = slug || "community";
    if (currentSlug === "community") {
      setEvent(null);
      return;
    }

    try {
      const allEvents = await eventService.getAll();
      const slugify = (text) => text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end

      const found = allEvents.find((e) => slugify(e.title) === currentSlug || e._id === currentSlug);
      if (found) {
        setEvent(found);
      } else {
        // Fallback title parsed from slug
        const formattedTitle = currentSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setEvent({ title: formattedTitle, _id: currentSlug });
      }
    } catch (err) {
      console.error("Failed to load event details by slug:", err);
    }
  }, [slug]);

  useEffect(() => {
    loadEventAndCover();
  }, [slug, loadEventAndCover]);

  return (
    <div className="min-h-screen bg-carbon text-white relative">
      {/* BUC India Brand Top Bar */}
      <div className="w-full bg-carbon-light border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/bucpng.png" alt="BUC India" className="w-10 h-10 rounded-full border border-copper/30 object-contain p-1 bg-white" />
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

      {/* Cover Pic Section */}
      <div className="w-full h-[40vh] md:h-[50vh] lg:h-[60vh] flex items-center justify-center bg-carbon border-b border-white/5 relative overflow-hidden">
        <img 
          src={coverPhoto || '/bg_images/WhatsApp%20Image%202026-06-11%20at%2010.45.18%20AM.jpeg'} 
          alt="Event Banner" 
          className="w-full h-full object-contain transition-transform duration-1000 transform hover:scale-102"
          style={{ opacity: 0.95 }}
        />
        {/* Subtle overlay gradient at the very bottom to blend with the carbon background without covering content */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-carbon to-transparent pointer-events-none" />
      </div>

      <div className="pt-10 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-7xl uppercase mb-4">
              Registration <span className="text-transparent outline-title">Portal</span>
            </h1>
            {event ? (
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-copper/10 border border-copper/30 rounded-full text-copper font-body text-xs tracking-wider uppercase">
                <Calendar size={14} /> Registering for: {event.title}
              </div>
            ) : (
              <p className="font-text text-steel-dim text-lg max-w-2xl mx-auto leading-relaxed">
                Select the type of registration below. Join as a rider, showcase your talent, partner your club, or volunteer with humanity calls.
              </p>
            )}
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:bg-white/5 sm:border sm:border-white/10 sm:p-1 sm:rounded-full w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("user")}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg sm:rounded-full font-body text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
                  activeTab === "user"
                    ? "bg-copper text-carbon font-bold"
                    : "bg-white/5 sm:bg-transparent text-steel-dim hover:text-white hover:bg-white/10 sm:hover:bg-white/5"
                }`}
              >
                <User size={14} className="shrink-0" /> <span className="truncate">User</span>
              </button>
              
              <button
                onClick={() => setActiveTab("talent")}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg sm:rounded-full font-body text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
                  activeTab === "talent"
                    ? "bg-copper text-carbon font-bold"
                    : "bg-white/5 sm:bg-transparent text-steel-dim hover:text-white hover:bg-white/10 sm:hover:bg-white/5"
                }`}
              >
                <Star size={14} className="shrink-0" /> <span className="truncate">Talent</span>
              </button>

              <button
                onClick={() => setActiveTab("club")}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg sm:rounded-full font-body text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
                  activeTab === "club"
                    ? "bg-copper text-carbon font-bold"
                    : "bg-white/5 sm:bg-transparent text-steel-dim hover:text-white hover:bg-white/10 sm:hover:bg-white/5"
                }`}
              >
                <Shield size={14} className="shrink-0" /> <span className="truncate">Club</span>
              </button>

              <button
                onClick={() => setActiveTab("volunteer")}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg sm:rounded-full font-body text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 text-center ${
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
                  href="https://humanitycalls.org/volunteer" 
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
