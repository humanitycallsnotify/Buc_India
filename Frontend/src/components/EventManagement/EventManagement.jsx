import React, { useState, useEffect } from "react";
import { eventService, registrationService } from "../../services/api";
import TimePicker from "../EventPicker/TimePicker";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Share2, 
  Edit3, 
  Trash2, 
  Users, 
  Award, 
  Search, 
  Calendar, 
  AlertTriangle,
  X,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from "lucide-react";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [formData, setFormData] = useState({
    title: "", description: "", eventDate: "", eventTime: "",
    location: "", meetingPoint: "", isActive: true, showOnHomepage: false, certificateEnabled: false,
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { filterEventsFn(); }, [events, filterName, filterDate, activeTab]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [eventsData, registrationsData] = await Promise.all([
        eventService.getAll(), registrationService.getAll()
      ]);
      setEvents(eventsData || []);
      setRegistrations(registrationsData || []);
    } catch (error) {
      toast.error("Failed to load operational data");
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationCount = (eventId) => {
    return (registrations || []).filter(reg =>
      (typeof reg.eventId === 'object' ? reg.eventId?._id : reg.eventId) === eventId
    ).length;
  };

  const handleShare = (eventId) => {
    const registrationLink = `${window.location.origin}/event-register/${eventId}`;
    navigator.clipboard.writeText(registrationLink).then(() => {
      toast.success("Deployment link copied to clipboard");
    }).catch(() => { toast.error("Failed to copy link"); });
  };

  const filterEventsFn = () => {
    let filtered = [...(events || [])];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    filtered = filtered.filter((event) => {
      const eventDate = new Date(event.eventDate); eventDate.setHours(0, 0, 0, 0);
      return activeTab === "upcoming" ? eventDate >= now : eventDate < now;
    });
    if (filterName.trim()) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(filterName.toLowerCase()),
      );
    }
    if (filterDate) {
      filtered = filtered.filter((event) => {
        const d = new Date(event.eventDate).toISOString().split('T')[0];
        return d === filterDate;
      });
    }
    setFilteredEvents(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingEvent && !bannerFile) { toast.error("Deployment banner is mandatory"); return; }
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (bannerFile) data.append('banner', bannerFile);
    setSubmitLoading(true);
    try {
      if (editingEvent) {
        await eventService.update(editingEvent._id, data);
        toast.success("Expedition updated successfully");
      } else {
        await eventService.create(data);
        toast.success("New Expedition published");
      }
      resetForm(); loadEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Communication failure during deployment");
    } finally { setSubmitLoading(false); }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", eventDate: "", eventTime: "", location: "", meetingPoint: "", isActive: true, showOnHomepage: false, certificateEnabled: false });
    setBannerFile(null); setBannerPreview(null); setEditingEvent(null); setShowForm(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "", description: event.description || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      eventTime: event.eventTime || "", location: event.location || "",
      meetingPoint: event.meetingPoint || "",
      isActive: event.isActive !== undefined ? event.isActive : true,
      showOnHomepage: event.showOnHomepage !== undefined ? event.showOnHomepage : false,
      certificateEnabled: event.certificateEnabled !== undefined ? event.certificateEnabled : false,
    });
    setBannerPreview(event.banner);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (eventId) => { setEventToDelete(eventId); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await eventService.delete(eventToDelete);
      toast.success("Expedition terminated");
      loadEvents(); setShowDeleteConfirm(false); setEventToDelete(null);
    } catch (error) { toast.error("Failed to terminate expedition"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-copper font-body text-[10px] tracking-ultra uppercase mb-2 block font-bold">Logistics Division</span>
          <h2 className="font-heading text-4xl uppercase leading-none text-white">Expedition <span className="text-copper">Management</span></h2>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          disabled={loading || submitLoading}
          className="btn-metallica flex items-center gap-3 disabled:opacity-50"
        >
          <Plus size={20} /> Deploy New
        </button>
      </div>

      {/* Deployment Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-carbon-light border border-white/5 p-8 md:p-12 mb-12 shadow-2xl relative">
              <button onClick={resetForm} className="absolute top-6 right-6 text-steel-dim hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <h3 className="font-heading text-2xl uppercase text-white mb-8 border-b border-white/5 pb-4">
                {editingEvent ? "Modify Mission" : "Instate New Mission"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Mission Designation</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 p-4 font-body text-xs text-white outline-none focus:border-copper transition-colors" placeholder="EVENT NAME" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Deployment Date</label>
                    <input name="eventDate" type="date" value={formData.eventDate} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 p-4 font-body text-xs text-white outline-none focus:border-copper transition-colors [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Time Window</label>
                    <TimePicker name="eventTime" value={formData.eventTime} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Sector/Location</label>
                    <input name="location" value={formData.location} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 p-4 font-body text-xs text-white outline-none focus:border-copper transition-colors" placeholder="COORDINATES" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Rendezvous Point</label>
                    <input name="meetingPoint" value={formData.meetingPoint} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 p-4 font-body text-xs text-white outline-none focus:border-copper transition-colors" placeholder="MEETING POINT" />
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Visual Asset (Banner)</label>
                    <label className="w-full border-2 border-dashed border-white/10 p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group">
                       <ImageIcon size={32} className="text-steel-dim group-hover:text-copper" />
                       <span className="font-body text-[10px] uppercase tracking-widest font-bold">Select Intelligence Interface</span>
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    {bannerPreview && (
                      <div className="relative group rounded-sm overflow-hidden border border-white/10">
                        <img src={bannerPreview} alt="Preview" className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-carbon/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="font-body text-[10px] uppercase tracking-widest font-bold text-white">Currently Selected Artifact</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Mission Briefing</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="w-full bg-carbon border border-white/10 p-4 font-body text-xs text-white outline-none focus:border-copper transition-colors resize-none" placeholder="DETAILS..." />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-8">
                     <label className="flex items-center gap-4 cursor-pointer">
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-copper' : 'bg-carbon-light border border-white/10'}`}>
                           <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${formData.isActive ? 'left-5 bg-carbon' : 'left-1 bg-steel-dim'}`} />
                        </div>
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="hidden" />
                        <div>
                           <div className="font-body text-[10px] uppercase tracking-widest font-bold text-white">Public Deployment</div>
                           <div className="text-[8px] text-steel-dim uppercase tracking-wider">{formData.isActive ? "Live in public nodes" : "Internal intelligence only"}</div>
                        </div>
                     </label>

                     <label className="flex items-center gap-4 cursor-pointer">
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.certificateEnabled ? 'bg-copper' : 'bg-carbon-light border border-white/10'}`}>
                           <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${formData.certificateEnabled ? 'left-5 bg-carbon' : 'left-1 bg-steel-dim'}`} />
                        </div>
                        <input type="checkbox" name="certificateEnabled" checked={formData.certificateEnabled} onChange={handleInputChange} className="hidden" />
                        <div>
                           <div className="font-body text-[10px] uppercase tracking-widest font-bold text-white">Merit Credentials</div>
                           <div className="text-[8px] text-steel-dim uppercase tracking-wider">{formData.certificateEnabled ? "Certificates active" : "Certificates restricted"}</div>
                        </div>
                     </label>

                     <label className="flex items-center gap-4 cursor-pointer">
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.showOnHomepage ? 'bg-copper' : 'bg-carbon-light border border-white/10'}`}>
                           <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${formData.showOnHomepage ? 'left-5 bg-carbon' : 'left-1 bg-steel-dim'}`} />
                        </div>
                        <input type="checkbox" name="showOnHomepage" checked={formData.showOnHomepage} onChange={handleInputChange} className="hidden" />
                        <div>
                           <div className="font-body text-[10px] uppercase tracking-widest font-bold text-white">Homepage Promotion</div>
                           <div className="text-[8px] text-steel-dim uppercase tracking-wider">{formData.showOnHomepage ? "Register Now banner visible" : "Hidden from homepage"}</div>
                        </div>
                     </label>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-white/5 pt-8">
                  <button type="submit" disabled={submitLoading} className="btn-metallica px-12 disabled:opacity-50">
                    {submitLoading ? "Processing..." : (editingEvent ? "Update Protocol" : "Initialize Protocol")}
                  </button>
                  <button type="button" onClick={resetForm} className="border border-white/10 text-white px-8 py-4 font-heading text-xl uppercase hover:bg-white/5 transition-all">
                    Abort
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs and Filters */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="p-1 bg-carbon-light border border-white/5 inline-flex">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2 font-body text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "upcoming" ? 'bg-copper text-carbon' : 'text-steel-dim hover:text-white'}`}
            >
              Upcoming Operations
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2 font-body text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "past" ? 'bg-copper text-carbon' : 'text-steel-dim hover:text-white'}`}
            >
              Archived Operations
            </button>
          </div>
          
          <div className="flex-grow md:flex-grow-0 relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" />
            <input 
              placeholder="SEARCH MANIFEST..." 
              value={filterName} 
              onChange={(e) => setFilterName(e.target.value)}
              className="bg-carbon border border-white/10 pl-10 pr-4 py-2 w-full md:w-64 font-body text-[10px] uppercase tracking-widest text-white outline-none focus:border-copper"
            />
          </div>

          <div className="relative">
            <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none" />
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-carbon border border-white/10 pl-10 pr-4 py-2 w-full md:w-48 font-body text-[10px] uppercase tracking-widest text-white outline-none focus:border-copper [color-scheme:dark]"
            />
          </div>

          {(filterName || filterDate) && (
            <button onClick={() => { setFilterName(""); setFilterDate(""); }} className="text-copper font-body text-[8px] uppercase tracking-widest font-bold hover:underline">
              Clear Filters
            </button>
          )}
        </div>

        <h3 className="font-heading text-xl uppercase tracking-widest text-white">
          Active Records: {filteredEvents.length}
        </h3>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-copper/10 border-t-copper rounded-full animate-spin"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-20 border border-white/5 bg-carbon-light text-center">
            <p className="font-text text-steel-dim uppercase tracking-ultra italic">No relevant intelligence found in this sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-carbon-light border border-white/10 group hover:border-copper/50 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
               {/* Accent line */}
               <div className="absolute top-0 left-0 w-full h-[1px] bg-copper opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

               <div className="relative h-48 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                  <img src={event.banner} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-4 right-4 flex gap-2">
                     {activeTab === 'upcoming' && (
                       <button onClick={() => handleShare(event._id)} className="p-2 bg-carbon/80 text-white hover:bg-copper hover:text-carbon transition-colors rounded-sm" title="Share link">
                          <Share2 size={14} />
                       </button>
                     )}
                     <span className={`px-2 py-1 font-body text-[8px] uppercase font-bold tracking-widest ${event.isActive ? 'bg-green-500 text-white' : 'bg-red-500/80 text-white'}`}>
                        {event.isActive ? "Active" : "Internal"}
                     </span>
                  </div>
               </div>

               <div className="p-8 flex-grow space-y-4">
                  <h4 className="font-heading text-2xl uppercase text-white truncate group-hover:text-copper transition-colors">{event.title}</h4>
                  <p className="font-text text-steel-dim text-xs line-clamp-2 leading-relaxed h-8">
                    {event.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 py-2">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/5">
                      <Users size={12} className="text-copper" />
                      <span className="font-body text-[10px] uppercase font-bold text-white tracking-widest">{getRegistrationCount(event._id)}</span>
                    </div>
                    {event.certificateEnabled && (
                      <div className="flex items-center gap-2 bg-copper/5 px-3 py-1.5 border border-copper/10">
                        <Award size={12} className="text-copper" />
                        <span className="font-body text-[10px] uppercase font-bold text-copper tracking-widest">Merit</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-steel-dim">
                     <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                        <Calendar size={12} className="text-copper/50" />
                        <span>{new Date(event.eventDate).toLocaleDateString()} @ {event.eventTime}</span>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest truncate">
                        <MapPin size={12} className="text-copper/50" />
                        <span>{event.location}</span>
                     </div>
                  </div>
               </div>

               <div className="p-4 bg-carbon/50 mt-auto flex items-center justify-between border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(event)} className="p-3 text-steel-dim hover:text-white hover:bg-white/5 transition-all">
                       <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(event._id)} className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
                       <Trash2 size={16} />
                    </button>
                  </div>
                  <button onClick={() => handleShare(event._id)} className="font-body text-[8px] uppercase tracking-widest font-bold text-steel-dim hover:text-copper transition-colors">
                     Open Manifest →
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-carbon/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-carbon-light border border-white/10 p-8 md:p-12 max-w-lg w-full relative z-[101]"
            >
               <div className="flex items-center gap-4 text-copper mb-6">
                  <AlertTriangle size={32} />
                  <h3 className="font-heading text-3xl uppercase">Terminate Mission?</h3>
               </div>
               <p className="font-text text-steel-dim text-sm leading-relaxed mb-10 pb-6 border-b border-white/5 italic">
                 This action will permanently purge the expedition data from the master manifest. This cannot be undone. Are you certain you wish to proceed with termination?
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-500 text-white font-heading text-lg uppercase py-4 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {deleting ? "Purging..." : "Confirm Termination"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 border border-white/10 text-white font-heading text-lg uppercase py-4 hover:bg-white/5 transition-all active:scale-95"
                  >
                    Abort
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventManagement;

