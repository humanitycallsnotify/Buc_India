import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";
import { eventService } from "../../services/api";
import { getRemainingSeats } from "../../constants/eventRegistrationConfig";
import { getRegistrationStatusLabel } from "../../utils/eventShareUtils";
import EventShareModal from "../EventShare/EventShareModal.jsx";
import OtpModal from "../OtpModal.jsx";

const PublicHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [pastLimit, setPastLimit] = useState(6);
  const [loading, setLoading] = useState(false);
  const [shareEvent, setShareEvent] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingEventId, setPendingEventId] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await eventService.getAll();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = allEvents
        .filter((event) => {
          if (!event.isActive) return false;
          const eventDate = new Date(event.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        })
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      const past = allEvents
        .filter((event) => {
          if (!event.isActive) return false;
          const eventDate = new Date(event.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today;
        })
        .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (event) => {
    const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    if (!isLoggedIn) {
      setPendingEventId(event._id);
      setShowAuthModal(true);
    } else {
      navigate(`/event-register/${event._id}`);
    }
  };

  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents.slice(0, pastLimit);

  const statusClass = (status) => {
    if (status === "Open") return "text-green-400";
    if (status === "Opens Soon") return "text-copper";
    return "text-steel-dim";
  };

  return (
    <section className="section-container py-24 bg-carbon text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <span className="text-copper font-body tracking-ultra text-xs md:text-sm uppercase mb-2 block font-bold">The Calendar</span>
            <h2 className="font-heading text-6xl md:text-8xl uppercase leading-none">The <span className="text-copper">Gatherings</span></h2>
          </div>
          
          <div className="flex bg-carbon-light border border-white/10 p-1">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={`px-8 py-3 font-body text-[10px] uppercase tracking-widest transition-all duration-500 ${activeTab === "upcoming" ? "bg-copper text-carbon font-bold" : "text-steel-dim hover:text-white"}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={`px-8 py-3 font-body text-[10px] uppercase tracking-widest transition-all duration-500 ${activeTab === "past" ? "bg-copper text-carbon font-bold" : "text-steel-dim hover:text-white"}`}
            >
              Past Events
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-copper/30 border-t-copper rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {displayedEvents.map((event) => {
              const remaining = getRemainingSeats(event);
              const regStatus = getRegistrationStatusLabel(event);
              return (
              <div key={event._id} className="group relative border border-white/5 bg-carbon-light overflow-hidden flex flex-col">
                <div className="relative aspect-[16/9] overflow-hidden bg-carbon flex items-center justify-center">
                  <img src={event.banner} alt={event.title} className="w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.02]" />
                  <div className="absolute top-4 left-4 bg-copper text-carbon px-3 py-1 font-heading text-xs uppercase">
                    {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  {activeTab === "upcoming" && (
                    <div className={`absolute top-4 right-4 bg-carbon/90 border border-white/10 px-3 py-1 font-body text-[10px] uppercase tracking-widest ${statusClass(regStatus)}`}>
                      {regStatus}
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="font-heading text-2xl uppercase group-hover:text-copper transition-colors">{event.title}</h3>
                    <div className="text-right shrink-0">
                      {remaining != null && activeTab === "upcoming" && (
                        <span className="text-copper font-body text-[10px] uppercase tracking-tighter whitespace-nowrap block">
                          {remaining} SEATS LEFT
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="font-text text-steel-dim text-sm mb-6 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-3 mb-8">
                     <div className="flex items-center gap-3 text-steel-dim">
                        <span className="w-1 h-1 bg-copper rounded-full"></span>
                        <span className="font-body text-[10px] uppercase tracking-widest">{event.location || event.meetingPoint || "Venue TBA"}</span>
                     </div>
                     <div className="flex items-center gap-3 text-steel-dim">
                        <span className="w-1 h-1 bg-copper rounded-full"></span>
                        <span className="font-body text-[10px] uppercase tracking-widest">{event.eventTime}</span>
                     </div>
                  </div>

                  <div className="mt-auto flex gap-3">
                    <button 
                      disabled={activeTab === "past"}
                      onClick={() => handleRegisterClick(event)}
                      className={`flex-1 py-4 border font-body text-[10px] uppercase tracking-widest transition-all duration-500 ${
                        activeTab === "past" 
                        ? "border-white/5 text-white/20 cursor-not-allowed" 
                        : "border-white/10 text-white hover:bg-copper hover:text-carbon hover:border-copper"
                      }`}
                    >
                      {activeTab === "past" ? "COMPLETED" : "REGISTER"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareEvent(event)}
                      className="px-4 py-4 border border-white/10 text-steel-dim hover:text-copper hover:border-copper/50 transition-all"
                      title="Share event"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </div>
        )}
      </div>

      <AnimatePresence>
        {shareEvent && (
          <EventShareModal event={shareEvent} onClose={() => setShareEvent(null)} />
        )}
      </AnimatePresence>
      <OtpModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => {
          setShowAuthModal(false);
          if (pendingEventId) {
            navigate(`/event-register/${pendingEventId}`);
          }
        }} 
        defaultType="event_registration" 
        disableMobileAuth={true}
      />
    </section>
  );
};

export default PublicHome;
