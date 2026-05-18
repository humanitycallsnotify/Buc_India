import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  eventService, 
  registrationService, 
  clubService, 
  clubMembershipService, 
  certificateService 
} from "../../services/api";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Award, 
  Plus, 
  Eye, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronRight
} from "lucide-react";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [activeEvents, setActiveEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("current");
  const [activeEvent, setActiveEvent] = useState(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clubStats, setClubStats] = useState({
    totalClubs: 0, pendingClubs: 0, totalMembers: 0,
    totalExits: 0, totalEvents: 0, totalCertificates: 0,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [events, registrations, clubs, memberships, certificates] = await Promise.all([
        eventService.getAll(), registrationService.getAll(),
        clubService.getAllAdmin(), clubMembershipService.getAllAdmin(),
        certificateService.getAll()
      ]);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const upcomingActiveEvents = (events || [])
        .filter((event) => {
          if (!event.isActive) return false;
          const eventDate = new Date(event.eventDate); eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        })
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      setActiveEvents(upcomingActiveEvents);
      const currentEvent = upcomingActiveEvents[0] || null;
      let targetEvent = currentEvent;
      if (selectedEventId !== "current") {
        targetEvent = upcomingActiveEvents.find((e) => e._id === selectedEventId) || currentEvent;
      }
      setActiveEvent(targetEvent);

      if (targetEvent) {
        const eventRegistrations = registrations.filter(
          (r) => (r.eventId?._id || r.eventId) === targetEvent._id
        );
        setRegisteredCount(eventRegistrations.length);
      } else {
        setRegisteredCount(0);
      }

      setClubStats({
        totalClubs: clubs.length,
        pendingClubs: clubs.filter((c) => c.status === "pending").length,
        totalMembers: memberships.filter((m) => m.status === "active").length,
        totalExits: memberships.filter((m) => m.status === "exited" && m.exitReason).length,
        totalEvents: events.length,
        totalCertificates: certificates.length,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) updateActiveEventSelection();
  }, [selectedEventId]);

  const updateActiveEventSelection = async () => {
    try {
      const currentEvent = activeEvents[0] || null;
      let targetEvent = currentEvent;
      if (selectedEventId !== "current") {
        targetEvent = activeEvents.find((e) => e._id === selectedEventId) || currentEvent;
      }
      setActiveEvent(targetEvent);
      if (targetEvent) {
        const registrations = await registrationService.getAll(targetEvent._id);
        setRegisteredCount(registrations.length);
      } else {
        setRegisteredCount(0);
      }
    } catch (error) {
      console.error("Failed to update event selection:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { icon: <Users size={24} />, title: "Total Clubs", value: clubStats.totalClubs, sub: `${clubStats.pendingClubs} PENDING ADMISSION`, color: "copper" },
    { icon: <UserCheck size={24} />, title: "Active Members", value: clubStats.totalMembers, sub: `${clubStats.totalExits} HISTORICAL EXITS`, color: "white" },
    { icon: <Calendar size={24} />, title: "Expeditions", value: clubStats.totalEvents, sub: `${registeredCount} CURRENT ENLISTED`, color: "copper" },
    { icon: <Award size={24} />, title: "Credentials", value: clubStats.totalCertificates, sub: "E-CERTIFICATES ISSUED", color: "white" },
  ];

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div>
        <span className="text-copper font-body text-[10px] tracking-ultra uppercase mb-2 block font-bold">Commander Overlay</span>
        <h2 className="font-heading text-4xl uppercase leading-none text-white">Dashboard <span className="text-transparent outline-title">Overview</span></h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="p-8 border border-white/5 bg-carbon-light group hover:border-copper/30 transition-all duration-500">
             <div className="flex items-center justify-between mb-6">
                <div className={`${stat.color === "copper" ? "text-copper" : "text-white"}`}>{stat.icon}</div>
                <TrendingUp size={16} className="text-white/10 group-hover:text-copper transition-colors" />
             </div>
             <div className="space-y-1">
                <h3 className="font-body text-[10px] uppercase tracking-widest text-steel-dim">{stat.title}</h3>
                <div className="font-heading text-5xl text-white">{stat.value}</div>
                <p className="font-body text-[8px] uppercase tracking-ultra text-copper font-bold">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event Selection & Focus */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <h3 className="font-heading text-2xl uppercase tracking-widest text-white flex items-center gap-3">
              <Calendar size={20} className="text-copper" />
              Operational Focus
            </h3>
            {activeEvents.length > 0 && (
              <select 
                value={selectedEventId} 
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-carbon border border-white/10 px-4 py-2 font-body text-[10px] uppercase tracking-widest text-white outline-none focus:border-copper transition-colors"
              >
                <option value="current">CURRENT EXPEDITION</option>
                {activeEvents.map((e) => (
                  <option key={e._id} value={e._id}>{e.title.toUpperCase()}</option>
                ))}
              </select>
            )}
          </div>

          {activeEvent ? (
            <div className="border border-white/5 bg-carbon-light p-8 md:p-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4">
                  <span className="bg-copper/10 text-copper px-3 py-1 font-body text-[8px] uppercase tracking-widest font-bold border border-copper/20">Active</span>
               </div>
               
               <div className="mb-8">
                  <h4 className="font-heading text-4xl uppercase mb-4 text-white leading-none">{activeEvent.title}</h4>
                  <p className="font-text text-steel-dim text-sm max-w-2xl leading-relaxed italic">{activeEvent.description}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                  <div className="space-y-2">
                    <span className="flex items-center gap-2 text-copper font-body text-[8px] uppercase tracking-widest font-bold">
                      <Clock size={12} /> Schedule
                    </span>
                    <p className="text-white font-body text-xs uppercase">{new Date(activeEvent.eventDate).toLocaleDateString()} @ {activeEvent.eventTime}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-copper font-body text-[8px] uppercase tracking-widest font-bold">Coordinate</span>
                    <p className="text-white font-body text-xs uppercase">{activeEvent.location}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-copper font-body text-[8px] uppercase tracking-widest font-bold">Checkpoint</span>
                    <p className="text-white font-body text-xs uppercase">{activeEvent.meetingPoint || "N/A"}</p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="p-12 border border-dashed border-white/10 text-center">
              <p className="font-text text-steel-dim text-sm uppercase tracking-widest">No Active Expeditions Detected.</p>
            </div>
          )}
        </div>

        {/* Right Column: Participant Metrics & Quick Actions */}
        <div className="space-y-8">
          {/* Enlisted Participants */}
          <div className="p-8 border border-white/5 bg-gradient-to-br from-copper/10 to-transparent text-center group">
             <div className="font-heading text-8xl text-white mb-2 transform group-hover:scale-110 transition-transform duration-700">{registeredCount}</div>
             <h4 className="font-heading text-xl uppercase mb-6">Enlisted Participats</h4>
             <button
               onClick={() => {
                 const id = selectedEventId === "current" ? activeEvents[0]?._id || "current" : selectedEventId;
                 navigate("/admin/registrations", { state: { selectedEventId: id } });
               }}
               disabled={!activeEvent}
               className="btn-metallica w-full flex items-center justify-center gap-3 disabled:opacity-50"
             >
               View Manifest <ArrowRight size={14} />
             </button>
          </div>

          {/* Actions */}
          <div className="space-y-4">
             <h4 className="font-heading text-lg uppercase tracking-widest text-white border-b border-white/5 pb-2">Protocols</h4>
             <button 
               onClick={() => navigate("/admin/events")} 
               className="w-full p-6 border border-white/5 bg-carbon-light flex items-center justify-between hover:border-copper/30 transition-all group"
             >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-copper/10 flex items-center justify-center text-copper">
                      <Plus size={20} />
                   </div>
                   <div className="text-left">
                      <div className="font-body text-[10px] uppercase font-bold text-white tracking-widest">Post Expedition</div>
                      <div className="text-[9px] text-steel-dim uppercase tracking-wider">Publish to community</div>
                   </div>
                </div>
                <ChevronRight size={16} className="text-white/10 group-hover:text-copper transition-colors" />
             </button>
             
             <button 
               onClick={() => navigate("/admin/registrations")} 
               className="w-full p-6 border border-white/5 bg-carbon-light flex items-center justify-between hover:border-copper/30 transition-all group"
             >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                      <Eye size={20} />
                   </div>
                   <div className="text-left">
                      <div className="font-body text-[10px] uppercase font-bold text-white tracking-widest">Audit Enlistments</div>
                      <div className="text-[9px] text-steel-dim uppercase tracking-wider">Export participants data</div>
                   </div>
                </div>
                <ChevronRight size={16} className="text-white/10 group-hover:text-copper transition-colors" />
             </button>
          </div>

          <div className="p-6 bg-white/5 border border-white/5 rounded-sm flex gap-4">
             <AlertCircle className="text-copper shrink-0" size={20} />
             <p className="text-[9px] text-steel-dim font-body uppercase leading-relaxed tracking-widest">
               <strong>Operational Tip:</strong> Deploy "Public Site" to verify visual fidelity of expeditions across all nodes.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
