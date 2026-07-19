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
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import EventRegistrationConfigPanel, {
  createDefaultRegistrationFields,
  createDefaultRegistrationSettings,
} from "./EventRegistrationConfigPanel.jsx";
import EventShareModal from "../EventShare/EventShareModal.jsx";
import { useNavigate } from "react-router-dom";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ITINERARY_CATEGORIES = [
  "Registration",
  "Parking",
  "Breakfast",
  "Ride Start",
  "Fuel Stop",
  "Games",
  "Photography",
  "Lunch",
  "Awards",
  "Closing",
  "Custom",
];

const EventManagement = () => {
  const navigate = useNavigate();
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
  const [registrationFields, setRegistrationFields] = useState(createDefaultRegistrationFields());
  const [registrationSettings, setRegistrationSettings] = useState(createDefaultRegistrationSettings());
  const [customQuestions, setCustomQuestions] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [shareEvent, setShareEvent] = useState(null);

  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = React.useRef(null);

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { filterEventsFn(); }, [events, filterName, filterDate, activeTab]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsResult = await eventService.getAll().then(
        (v) => ({ ok: true, data: Array.isArray(v) ? v : [] }),
        (err) => ({ ok: false, err }),
      );
      if (eventsResult.ok) {
        setEvents(eventsResult.data);
      } else {
        setEvents([]);
        toast.error("Failed to load events");
      }

      try {
        const registrationsData = await registrationService.getAll();
        setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
      } catch {
        setRegistrations([]);
      }
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

  const handleShare = (event) => {
    setShareEvent(event);
  };

  const handleViewRegistrations = (eventId) => {
    navigate(`/admin/registrations?eventId=${eventId}`);
  };

  const handlePreview = (eventId) => {
    window.open(`/event-register/${eventId}`, "_blank", "noopener,noreferrer");
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
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "");
      setShowCropModal(true);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 16 / 9, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "banner-cropped.jpg", { type: "image/jpeg" });
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(blob));
      setShowCropModal(false);
    }, "image/jpeg");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingEvent && !bannerFile) { toast.error("Deployment banner is mandatory"); return; }
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append("registrationFields", JSON.stringify(registrationFields));
    data.append("registrationSettings", JSON.stringify(registrationSettings));
    data.append("customQuestions", JSON.stringify(customQuestions));
    data.append("itinerary", JSON.stringify(itinerary));
    data.append("gallery", JSON.stringify(gallery));
    if (bannerFile) data.append('banner', bannerFile);
    newGalleryFiles.forEach((file) => {
      data.append('gallery', file);
    });
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
    setRegistrationFields(createDefaultRegistrationFields());
    setRegistrationSettings(createDefaultRegistrationSettings());
    setCustomQuestions([]);
    setItinerary([]);
    setGallery([]);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
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
    setRegistrationFields({
      ...createDefaultRegistrationFields(),
      ...(event.registrationFields || {}),
    });
    setRegistrationSettings({
      ...createDefaultRegistrationSettings(),
      ...(event.registrationSettings || {}),
    });
    setCustomQuestions(Array.isArray(event.customQuestions) ? event.customQuestions : []);
    setItinerary(Array.isArray(event.itinerary) ? event.itinerary : []);
    setGallery(Array.isArray(event.gallery) ? event.gallery : []);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
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

                  {/* Event Itinerary Section */}
                  <div className="md:col-span-2 space-y-4 border-t border-white/5 pt-8">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="text-copper" size={22} />
                      <h4 className="font-heading text-2xl uppercase text-white">
                        Event <span className="text-copper">Itinerary</span>
                      </h4>
                    </div>
                    <p className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-6">
                      Add schedule points for the event. Reorder them using the arrows.
                    </p>

                    <div className="space-y-4">
                      {itinerary.map((item, index) => (
                        <div key={index} className="bg-carbon border border-white/10 p-5 rounded-sm flex flex-col md:flex-row gap-4 items-start md:items-center relative">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <div className="space-y-1">
                              <label className="text-[10px] text-steel-dim uppercase tracking-wider block font-bold">Time</label>
                              <input
                                type="text"
                                placeholder="e.g. 07:00 AM"
                                value={item.time}
                                onChange={(e) => {
                                  const next = [...itinerary];
                                  next[index].time = e.target.value;
                                  setItinerary(next);
                                }}
                                required
                                className="w-full bg-carbon-light border border-white/10 p-3 font-body text-xs text-white outline-none focus:border-copper"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-steel-dim uppercase tracking-wider block font-bold">Category</label>
                              <select
                                value={item.category}
                                onChange={(e) => {
                                  const next = [...itinerary];
                                  next[index].category = e.target.value;
                                  setItinerary(next);
                                }}
                                required
                                className="w-full bg-carbon-light border border-white/10 p-3 font-body text-xs text-white outline-none focus:border-copper"
                              >
                                <option value="">Select Category</option>
                                {ITINERARY_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[10px] text-steel-dim uppercase tracking-wider block font-bold">Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Flag Off"
                                value={item.title}
                                onChange={(e) => {
                                  const next = [...itinerary];
                                  next[index].title = e.target.value;
                                  setItinerary(next);
                                }}
                                required
                                className="w-full bg-carbon-light border border-white/10 p-3 font-body text-xs text-white outline-none focus:border-copper"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2 md:col-span-4">
                              <label className="text-[10px] text-steel-dim uppercase tracking-wider block font-bold">Description</label>
                              <textarea
                                placeholder="Brief description of this itinerary item..."
                                value={item.description || ""}
                                rows={2}
                                onChange={(e) => {
                                  const next = [...itinerary];
                                  next[index].description = e.target.value;
                                  setItinerary(next);
                                }}
                                className="w-full bg-carbon-light border border-white/10 p-3 font-body text-xs text-white outline-none focus:border-copper resize-none"
                              />
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (index === 0) return;
                                const next = [...itinerary];
                                [next[index], next[index - 1]] = [next[index - 1], next[index]];
                                setItinerary(next);
                              }}
                              disabled={index === 0}
                              className="p-2 border border-white/10 hover:border-copper hover:text-copper transition-colors disabled:opacity-30 disabled:pointer-events-none"
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (index === itinerary.length - 1) return;
                                const next = [...itinerary];
                                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                setItinerary(next);
                              }}
                              disabled={index === itinerary.length - 1}
                              className="p-2 border border-white/10 hover:border-copper hover:text-copper transition-colors disabled:opacity-30 disabled:pointer-events-none"
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setItinerary(itinerary.filter((_, i) => i !== index));
                              }}
                              className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setItinerary([...itinerary, { time: "", category: "Custom", title: "", description: "" }]);
                        }}
                        className="flex items-center gap-2 border border-dashed border-copper/40 text-copper px-4 py-3 font-body text-[10px] uppercase tracking-widest font-bold hover:bg-copper/10 transition-colors"
                      >
                        <Plus size={14} /> Add Itinerary Point
                      </button>
                    </div>
                  </div>

                  {/* Event Gallery Section */}
                  <div className="md:col-span-2 space-y-4 border-t border-white/5 pt-8">
                    <div className="flex items-center gap-3 mb-2">
                      <ImageIcon className="text-copper" size={22} />
                      <h4 className="font-heading text-2xl uppercase text-white">
                        Event <span className="text-copper">Gallery</span>
                      </h4>
                    </div>
                    <p className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-6">
                      Upload event photos for participants to view after the ride.
                    </p>

                    {/* Existing gallery images */}
                    {gallery.length > 0 && (
                      <div className="space-y-2">
                        <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Existing Gallery Photos</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {gallery.map((img, index) => (
                            <div key={index} className="relative group aspect-square rounded-sm overflow-hidden border border-white/10 bg-carbon">
                              <img src={img.url} alt="Gallery" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                              <button
                                type="button"
                                onClick={() => {
                                  setGallery(gallery.filter((_, i) => i !== index));
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Photo"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload new images */}
                    <div className="space-y-4">
                      <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">Upload New Photos</label>
                      <label className="w-full border-2 border-dashed border-white/10 p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group">
                        <Plus size={32} className="text-steel-dim group-hover:text-copper" />
                        <span className="font-body text-[10px] uppercase tracking-widest font-bold">Select Post-Event Images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            setNewGalleryFiles([...newGalleryFiles, ...files]);
                            
                            const previews = files.map((file) => URL.createObjectURL(file));
                            setNewGalleryPreviews([...newGalleryPreviews, ...previews]);
                          }}
                        />
                      </label>

                      {newGalleryPreviews.length > 0 && (
                        <div className="space-y-2">
                          <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim font-bold">New Photos Selected</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {newGalleryPreviews.map((preview, index) => (
                              <div key={index} className="relative group aspect-square rounded-sm overflow-hidden border border-white/10 bg-carbon animate-fade-in">
                                <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewGalleryFiles(newGalleryFiles.filter((_, i) => i !== index));
                                    setNewGalleryPreviews(newGalleryPreviews.filter((_, i) => i !== index));
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-sm"
                                  title="Remove Selection"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <EventRegistrationConfigPanel
                    registrationFields={registrationFields}
                    setRegistrationFields={setRegistrationFields}
                    registrationSettings={registrationSettings}
                    setRegistrationSettings={setRegistrationSettings}
                    customQuestions={customQuestions}
                    setCustomQuestions={setCustomQuestions}
                  />
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
                     <button onClick={() => handleShare(event)} className="p-2 bg-carbon/80 text-white hover:bg-copper hover:text-carbon transition-colors rounded-sm" title="Share">
                          <Share2 size={14} />
                       </button>
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

               <div className="p-4 bg-carbon/50 mt-auto flex flex-wrap items-center gap-1 border-t border-white/5">
                  <button onClick={() => handleEdit(event)} className="p-2.5 text-steel-dim hover:text-white hover:bg-white/5 transition-all rounded-sm" title="Edit">
                     <Edit3 size={16} />
                  </button>
                  <button onClick={() => handlePreview(event._id)} className="p-2.5 text-steel-dim hover:text-copper hover:bg-white/5 transition-all rounded-sm" title="View registration page">
                     <Eye size={16} />
                  </button>
                  <button onClick={() => handleViewRegistrations(event._id)} className="p-2.5 text-steel-dim hover:text-copper hover:bg-white/5 transition-all rounded-sm" title="View registrations">
                     <Users size={16} />
                  </button>
                  <button onClick={() => handleShare(event)} className="p-2.5 text-steel-dim hover:text-copper hover:bg-white/5 transition-all rounded-sm" title="Share">
                     <Share2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(event._id)} className="p-2.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-sm ml-auto" title="Delete">
                     <Trash2 size={16} />
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

      <AnimatePresence>
        {shareEvent && (
          <EventShareModal event={shareEvent} onClose={() => setShareEvent(null)} />
        )}
      </AnimatePresence>

      {/* Image Crop Modal */}
      <AnimatePresence>
        {showCropModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-carbon/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-carbon-light border border-white/10 p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-xl uppercase text-white">Crop Banner Image</h3>
                <button onClick={() => setShowCropModal(false)} className="text-steel-dim hover:text-white"><X size={20} /></button>
              </div>
              {imgSrc && (
                <div className="flex justify-center mb-6 overflow-hidden">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={16 / 9}
                  >
                    <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop me" style={{ maxHeight: "60vh" }} />
                  </ReactCrop>
                </div>
              )}
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowCropModal(false)} className="px-6 py-2 border border-white/10 text-white font-body text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={handleCropComplete} className="px-6 py-2 bg-copper text-carbon font-body text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors">Apply Crop</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventManagement;

