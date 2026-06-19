import React, { useEffect, useState } from "react";
import { galleryService } from "../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, 
  Calendar, 
  Tag, 
  Eye, 
  Trash2, 
  Plus, 
  X, 
  Edit3, 
  AlertTriangle,
  Check,
  ExternalLink,
  ChevronRight,
  Upload
} from "lucide-react";
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  IconButton,
  Dialog,
  DialogContent,
  Card,
  CardMedia
} from "@mui/material";

const categories = [
  { id: "all", label: "All Media" },
  { id: "rides", label: "Group Rides" },
  { id: "events", label: "Events" },
  { id: "bikes", label: "Member Bikes" },
  { id: "rallies", label: "Rallies" },
  { id: "highlights", label: "Ride Highlights (2–3s Clips)" },
  { id: "cover", label: "Cover Photo (Registration Portal)" },
];

const GalleryManagement = ({ isCoverOnly = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    eventName: isCoverOnly ? "Registration Portal Cover" : "",
    eventDate: isCoverOnly ? new Date().toISOString().split("T")[0] : "",
    category: isCoverOnly ? "cover" : "all",
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await galleryService.getAll();
      setItems(data || []);
    } catch (error) {
      console.error("Gallery sync failure:", error);
      toast.error("Telemetry failure: Gallery synchronization offline");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      eventName: isCoverOnly ? "Registration Portal Cover" : "",
      eventDate: isCoverOnly ? new Date().toISOString().split("T")[0] : "",
      category: isCoverOnly ? "cover" : "all",
    });
    setMediaFile(null);
    setMediaPreview(null);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setFormData({
      eventName: item.eventName,
      eventDate: item.eventDate ? item.eventDate.split("T")[0] : "",
      category: item.category || (isCoverOnly ? "cover" : "all"),
    });
    setMediaPreview(item.imageUrl);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayedItems = isCoverOnly
    ? items.filter((item) => item.category === "cover")
    : items.filter((item) => item.category !== "cover");

  const activeCategories = isCoverOnly
    ? [{ id: "cover", label: "Cover Photo (Registration Portal)" }]
    : [
        { id: "all", label: "All Media" },
        { id: "rides", label: "Group Rides" },
        { id: "events", label: "Events" },
        { id: "bikes", label: "Member Bikes" },
        { id: "rallies", label: "Rallies" },
        { id: "highlights", label: "Ride Highlights (2–3s Clips)" },
      ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && !mediaFile) {
      toast.error("Please select an image to upload");
      return;
    }
    if (formData.category !== 'cover' && (!formData.eventName || !formData.eventDate)) {
      toast.error("Designation and timestamp mandatory");
      return;
    }

    const data = new FormData();
    if (mediaFile) {
      data.append("media", mediaFile);
    }
    
    if (formData.category === 'cover') {
      data.append("eventName", "Registration Portal Cover");
      data.append("eventDate", new Date().toISOString());
    } else {
      data.append("eventName", formData.eventName);
      data.append("eventDate", formData.eventDate);
    }
    data.append("category", formData.category);

    setSubmitting(true);
    try {
      if (isEditing) {
        await galleryService.update(editId, data);
        toast.success("Intelligence manifest updated");
      } else if (isCoverOnly && displayedItems.length > 0) {
        const existingId = displayedItems[0]._id;
        await galleryService.update(existingId, data);
        toast.success("Cover photo successfully updated");
      } else {
        await galleryService.create(data);
        toast.success("Image added to gallery");
      }
      resetForm();
      loadItems();
    } catch (error) {
      console.error("Archival failure:", error);
      toast.error(error.response?.data?.message || "Communication failure during cataloging");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setShowDeleteConfirm(null);
    try {
      await galleryService.delete(id);
      toast.success("Artifact neutralized");
      setItems((prev) => prev.filter((item) => item._id !== id));
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Neutralization failure:", error);
      toast.error("Protocol failure: Artifact persistence detected");
    }
  };

  const getCategoryLabel = (id) => {
    const allCats = [
      { id: "all", label: "All Media" },
      { id: "rides", label: "Group Rides" },
      { id: "events", label: "Events" },
      { id: "bikes", label: "Member Bikes" },
      { id: "rallies", label: "Rallies" },
      { id: "highlights", label: "Ride Highlights (2–3s Clips)" },
      { id: "cover", label: "Cover Photo (Registration Portal)" },
    ];
    const cat = allCats.find((c) => c.id === id);
    return cat ? cat.label : id;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-copper font-body text-[10px] tracking-ultra uppercase mb-2 block font-bold">
            {isCoverOnly ? "Registration Portal" : "Archives Division"}
          </span>
          <h2 className="font-heading text-4xl uppercase leading-none text-white">
            {isCoverOnly ? (
              <>Cover <span className="text-transparent outline-title">Photo</span></>
            ) : (
              <>Visual <span className="text-transparent outline-title">Intelligence</span></>
            )}
          </h2>
        </div>
        <div className="flex gap-4">
          <a
            href={isCoverOnly ? "/" : "/gallery"}
            target="_blank"
            className="border border-white/10 text-white px-6 py-3 font-heading text-lg uppercase hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <ExternalLink size={16} /> {isCoverOnly ? "View Portal" : "View Node"}
          </a>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-metallica flex items-center gap-2"
          >
            <Plus size={18} /> {isCoverOnly ? "Upload Cover" : "Archive New"}
          </button>
        </div>
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="event-form-container">
              <div className="event-form">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Anton', color: 'white', textTransform: 'uppercase' }}>
                    {isEditing ? "Modify Archive Entry" : "Ingest New Artifact"}
                  </Typography>
                  <IconButton onClick={resetForm} sx={{ color: 'white' }}>
                    <X size={20} />
                  </IconButton>
                </Box>
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={4}>
                    {formData.category !== 'cover' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Name"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            required={formData.category !== 'cover'}
                            variant="outlined"
                            sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Date"
                            type="date"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleChange}
                            required={formData.category !== 'cover'}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                          />
                        </Grid>
                      </>
                    )}
                    {!isCoverOnly && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Category</InputLabel>
                          <Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            label="Category"
                            sx={{ color: 'white' }}
                          >
                            {activeCategories.map((cat) => (
                              <MenuItem key={cat.id} value={cat.id}>
                                {cat.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item xs={12} md={isCoverOnly ? 12 : 6}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<Upload />}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', py: 1.5 }}
                      >
                        {isEditing ? "Override Media" : "Select Visual Asset"}
                        <input
                          type="file"
                          hidden
                          accept="image/*,video/*"
                          onChange={handleMediaChange}
                        />
                      </Button>
                    </Grid>

                    {(mediaPreview) && (
                      <Grid item xs={12}>
                        <Box sx={{ position: 'relative', height: 200, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img 
                            src={mediaPreview} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="btn-metallica"
                      sx={{ px: 6 }}
                    >
                      {submitting ? "Processing..." : (isEditing ? "Update Manifest" : "Execute Ingestion")}
                    </Button>
                    <Button 
                      onClick={resetForm}
                      sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archives Grid */}
      <div className="space-y-6">
        <h3 className="font-heading text-xl uppercase tracking-widest text-white flex items-center gap-3">
          <ImageIcon size={20} className="text-copper" />
          {isCoverOnly ? `Cover Photos (${displayedItems.length})` : `Cataloged Artifacts (${displayedItems.length})`}
        </h3>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-copper/10 border-t-copper rounded-full animate-spin"></div>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="p-20 border border-white/5 bg-carbon-light text-center">
              <p className="font-text text-steel-dim uppercase tracking-ultra italic">
                {isCoverOnly ? "No cover photos have been uploaded yet." : "The archives are currently void of intelligence."}
              </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedItems.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                whileHover={{ y: -5 }}
                className="bg-carbon border border-white/5 group relative overflow-hidden h-[300px]"
              >
                {isCoverOnly && index === 0 && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-green-500 text-carbon font-heading text-[10px] uppercase tracking-widest font-black shadow-lg">
                    Active Cover
                  </div>
                )}
                <img
                  src={item.imageUrl}
                  alt={item.eventName}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-copper/10 border border-copper/20 text-copper font-body text-[8px] uppercase tracking-widest font-bold">
                       {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <h4 className="font-heading text-xl text-white uppercase truncate mb-1">{item.eventName}</h4>
                  <div className="flex items-center gap-2 text-steel-dim text-[8px] uppercase tracking-widest font-bold mb-4">
                    <Calendar size={10} className="text-copper" />
                    {new Date(item.eventDate).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSelectedItem(item)} className="text-white hover:text-copper transition-colors flex items-center gap-1 font-body text-[10px] uppercase tracking-widest font-bold">
                       <Eye size={14} /> Full View
                    </button>
                    <button onClick={() => handleEdit(item)} className="text-white hover:text-copper transition-colors flex items-center gap-1 font-body text-[10px] uppercase tracking-widest font-bold">
                       <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={() => setShowDeleteConfirm(item._id)} className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 font-body text-[10px] uppercase tracking-widest font-bold">
                       <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-carbon/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-6xl w-full max-h-[90vh] bg-carbon border border-white/10 relative z-[201] overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 text-white bg-carbon/50 p-2 hover:bg-copper hover:text-carbon transition-all z-[205]"
              >
                <X size={24} />
              </button>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                <div className="lg:col-span-2 bg-black flex items-center justify-center min-h-[40vh] lg:min-h-0">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.eventName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-12 space-y-8 flex flex-col justify-center border-l border-white/5 bg-carbon-light/50">
                  <div>
                    <span className="text-copper font-body text-[10px] tracking-ultra uppercase mb-2 block font-bold">Artifact Meta-Data</span>
                    <h3 className="font-heading text-4xl text-white uppercase leading-tight">{selectedItem.eventName}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-steel-dim uppercase tracking-widest text-[10px] font-bold">
                       <Calendar size={16} className="text-copper" />
                       <span className="text-white">{new Date(selectedItem.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-steel-dim uppercase tracking-widest text-[10px] font-bold">
                       <Tag size={16} className="text-copper" />
                       <span className="text-white">{getCategoryLabel(selectedItem.category)}</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex gap-4">
                     <button onClick={() => { handleEdit(selectedItem); setSelectedItem(null); }} className="flex-1 bg-white/5 border border-white/10 text-white py-4 font-heading text-xl uppercase hover:bg-white hover:text-carbon transition-all">
                        Edit Manifest
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-carbon/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-carbon-light border border-white/10 p-12 max-w-lg w-full relative z-[201]"
            >
               <div className="flex items-center gap-4 text-copper mb-6">
                  <AlertTriangle size={32} />
                  <h3 className="font-heading text-3xl uppercase">Neutralize Artifact?</h3>
               </div>
               <p className="font-text text-steel-dim text-sm italic mb-10 pb-6 border-b border-white/5">
                 This visual intelligence will be permanently purged from the strategic archives. This protocol cannot be reversed. Confirm neutralization?
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 bg-red-50 text-white font-heading text-xl uppercase py-4 hover:bg-red-600 transition-all active:scale-95"
                  >
                    Purge Artifact
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 border border-white/10 text-white font-heading text-xl uppercase py-4 hover:bg-white/5 transition-all"
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

export default GalleryManagement;

