import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit3, Trash2, Upload, X, Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import { internationalProfileService } from "../../services/api";

const COUNTRY_OPTIONS = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SG", label: "Singapore" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "BR", label: "Brazil" },
  { value: "RU", label: "Russia" },
  { value: "ZA", label: "South Africa" },
  { value: "NL", label: "Netherlands" },
  { value: "CH", label: "Switzerland" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "NZ", label: "New Zealand" },
  { value: "MY", label: "Malaysia" },
  { value: "TH", label: "Thailand" },
  { value: "ID", label: "Indonesia" },
  { value: "PH", label: "Philippines" },
  { value: "VN", label: "Vietnam" },
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#0c0c0e',
    borderColor: state.isFocused ? '#ca8a04' : 'rgba(255, 255, 255, 0.1)',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    padding: '4px',
    borderRadius: '0px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#16161a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#ca8a04' 
      : state.isFocused 
        ? 'rgba(202, 138, 4, 0.1)' 
        : 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#ca8a04',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#ffffff',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgba(202, 138, 4, 0.1)',
    border: '1px solid rgba(202, 138, 4, 0.3)',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#ffffff',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#ca8a04',
    '&:hover': {
      backgroundColor: 'rgba(202, 138, 4, 0.2)',
      color: '#ffffff',
    },
  }),
  input: (base) => ({
    ...base,
    color: '#ffffff',
  }),
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  designation: "",
  country: "",
  visitedCountries: [],
  shortBio: "",
  fullArticle: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  websiteUrl: "",
  linkedInUrl: "",
  displayOrder: "0",
  isActive: true,
};

const InternationalProfileManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await internationalProfileService.getAll();
      setItems(data || []);
    } catch (error) {
      toast.error("Failed to load international profiles");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    const names = (item.fullName || "").trim().split(/\s+/);
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "";

    setFormData({
      firstName,
      lastName,
      designation: item.designation || "",
      country: item.country || "",
      visitedCountries: item.visitedCountries || [],
      shortBio: item.shortBio || "",
      fullArticle: item.fullArticle || "",
      instagramUrl: item.instagramUrl || "",
      facebookUrl: item.facebookUrl || "",
      twitterUrl: item.twitterUrl || "",
      websiteUrl: item.websiteUrl || "",
      linkedInUrl: item.linkedInUrl || "",
      displayOrder: String(item.displayOrder ?? 0),
      isActive: item.isActive !== false,
    });
    setPhotoPreview(item.profilePhoto || null);
    setPhotoFile(null);
    setVideoPreview(item.profileVideo || null);
    setVideoFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First Name and Last Name are required");
      return;
    }
    if (!formData.country) {
      toast.error("Country is required");
      return;
    }
    if (!editId && !photoFile) {
      toast.error("Profile photo is required");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "isActive") {
          data.append(key, value ? "true" : "false");
        } else if (key === "visitedCountries") {
          value.forEach(c => data.append("visitedCountries", c));
        } else if (key === "firstName" || key === "lastName") {
          // Do nothing, we handle these separately
        } else {
          data.append(key, value);
        }
      });
      data.append("fullName", `${formData.firstName.trim()} ${formData.lastName.trim()}`);
      if (photoFile) data.append("profilePhoto", photoFile);
      if (videoFile) data.append("profileVideo", videoFile);

      if (editId) {
        await internationalProfileService.update(editId, data);
        toast.success("Profile updated");
      } else {
        await internationalProfileService.create(data);
        toast.success("Profile created");
      }
      resetForm();
      loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await internationalProfileService.delete(deleteId);
      toast.success("Profile deleted");
      setDeleteId(null);
      loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-copper font-body text-[10px] tracking-ultra uppercase mb-2 block font-bold">
            Global Content
          </span>
          <h2 className="font-heading text-4xl uppercase leading-none text-white">
            International <span className="text-copper">Profiles</span>
          </h2>
          <p className="font-text text-steel-dim text-sm mt-4 max-w-2xl">
            Manage profiles displayed on the public International page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-copper text-carbon font-body text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors"
        >
          <Plus size={16} /> Add Profile
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-8 border border-white/10 bg-carbon-light space-y-8 animate-fade-in"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="font-heading text-2xl uppercase text-white">
              {editId ? "Edit Profile" : "New Profile"}
            </h3>
            <button type="button" onClick={resetForm} className="text-steel-dim hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* 1. Media Uploads at the Top */}
          <div className="space-y-4">
            <h4 className="font-body text-xs uppercase tracking-wider text-copper font-bold">Media Uploads</h4>
            <div className="grid md:grid-cols-2 gap-8 p-6 bg-carbon/50 border border-white/5">
              {/* Profile Photo (Required) */}
              <div className="space-y-4">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim block">Profile Photo (Required) *</span>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-white/20 cursor-pointer hover:border-copper/45 hover:bg-white/5 transition-all w-fit">
                    <Upload size={16} className="text-copper" />
                    <span className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
                      {editId ? "Replace Photo" : "Upload Photo *"}
                    </span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  
                  {/* Dynamic Country Flags beneath the Profile Picture Preview */}
                  <div className="flex flex-col gap-2 mt-2">
                    {photoPreview ? (
                      <div className="relative w-32 h-32">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover border border-white/10 rounded-full" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full border border-dashed border-white/10 flex items-center justify-center text-steel-dim text-xs">
                        No Photo Selected
                      </div>
                    )}
                    
                    <div className="flex gap-2 flex-wrap items-center mt-2 min-h-[30px]">
                      {formData.country && (
                        <div className="flex items-center gap-1 bg-copper/10 px-2 py-0.5 border border-copper/30">
                          <ReactCountryFlag countryCode={formData.country} svg style={{ width: '1.2em', height: '1.2em' }} />
                          <span className="text-[9px] uppercase text-white font-body tracking-wider">Home</span>
                        </div>
                      )}
                      {formData.visitedCountries && formData.visitedCountries.map((cCode) => (
                        <div key={cCode} className="flex items-center gap-1 bg-white/5 px-2 py-0.5 border border-white/10">
                          <ReactCountryFlag countryCode={cCode} svg style={{ width: '1.2em', height: '1.2em' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Video (Optional) */}
              <div className="space-y-4">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim block">Profile Video (Optional)</span>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-white/20 cursor-pointer hover:border-copper/45 hover:bg-white/5 transition-all w-fit">
                    <Upload size={16} className="text-copper" />
                    <span className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
                      {videoPreview ? "Replace Video" : "Upload Video"}
                    </span>
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </label>
                  
                  {videoPreview ? (
                    <div className="w-full max-w-[280px] aspect-video border border-white/10 bg-carbon">
                      <video src={videoPreview} controls className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full max-w-[280px] aspect-video border border-dashed border-white/10 flex items-center justify-center text-steel-dim text-xs">
                      No Video Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Basic Details */}
          <div className="space-y-4">
            <h4 className="font-body text-xs uppercase tracking-wider text-copper font-bold">Basic Details</h4>
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-carbon/50 border border-white/5">
              <label className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">First Name *</span>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm text-white outline-none focus:border-copper" />
              </label>
              
              <label className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Last Name *</span>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm text-white outline-none focus:border-copper" />
              </label>
              
              <div className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Designation / Title</span>
                <Select
                  options={[
                    { value: "National Rider", label: "National Rider" },
                    { value: "International Rider", label: "International Rider" }
                  ]}
                  value={formData.designation ? { value: formData.designation, label: formData.designation } : null}
                  onChange={(selected) => setFormData(prev => ({ ...prev, designation: selected ? selected.value : "" }))}
                  styles={customSelectStyles}
                  isSearchable={false}
                  placeholder="Select Designation"
                />
              </div>
              
              {/* Primary Country Selector */}
              <div className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Country *</span>
                <Select
                  options={COUNTRY_OPTIONS}
                  value={COUNTRY_OPTIONS.find(o => o.value === formData.country) || null}
                  onChange={(selected) => setFormData(prev => ({ ...prev, country: selected ? selected.value : "" }))}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Search & Select Country"
                />
              </div>

              {/* Visited Countries Selector */}
              <div className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Visited Countries</span>
                <Select
                  isMulti
                  options={COUNTRY_OPTIONS}
                  value={COUNTRY_OPTIONS.filter(o => formData.visitedCountries?.includes(o.value))}
                  onChange={(selected) => setFormData(prev => ({ ...prev, visitedCountries: selected ? selected.map(o => o.value) : [] }))}
                  styles={customSelectStyles}
                  isSearchable
                  placeholder="Search & Select Visited Countries"
                />
              </div>

              <label className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Display Order</span>
                <input name="displayOrder" type="number" value={formData.displayOrder} onChange={handleChange} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm text-white outline-none focus:border-copper" />
              </label>

              <div className="flex items-center h-full pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="accent-copper" />
                  <span className="font-body text-xs uppercase tracking-widest text-steel-dim">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Remaining Fields */}
          <div className="space-y-4">
            <h4 className="font-body text-xs uppercase tracking-wider text-copper font-bold">Remaining Fields</h4>
            <div className="space-y-6 p-6 bg-carbon/50 border border-white/5">
              <label className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Short Bio</span>
                <textarea name="shortBio" value={formData.shortBio} onChange={handleChange} rows={2} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm text-white outline-none focus:border-copper resize-none" />
              </label>

              <label className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Full Article</span>
                <textarea name="fullArticle" value={formData.fullArticle} onChange={handleChange} rows={6} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm text-white outline-none focus:border-copper resize-y" />
              </label>

              <div className="grid md:grid-cols-2 gap-6">
                {["instagramUrl", "facebookUrl", "twitterUrl", "websiteUrl", "linkedInUrl"].map((field) => (
                  <label key={field} className="space-y-2 block">
                    <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">{field.replace("Url", " URL")}</span>
                    <input name={field} value={formData[field]} onChange={handleChange} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm text-white outline-none focus:border-copper" />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t border-white/5 pt-6">
            <button type="submit" disabled={submitting} className="px-8 py-3 bg-copper text-carbon font-body text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors disabled:opacity-50">
              {submitting ? "Saving..." : editId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="px-8 py-3 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-white/5">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-2 border-copper/20 border-t-copper rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 border border-white/5 bg-carbon-light text-center text-steel-dim font-body text-sm uppercase tracking-widest">
          No profiles yet
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item._id} className="flex flex-col md:flex-row md:items-center gap-4 p-6 border border-white/5 bg-carbon hover:border-white/10 transition-colors">
              <img src={item.profilePhoto || "/logo.jpg"} alt={item.fullName} className="w-16 h-16 object-cover border border-white/10 flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-heading text-xl uppercase text-white">{item.fullName}</h4>
                  {item.isActive ? (
                    <span className="flex items-center gap-1 text-green-500 text-[10px] uppercase tracking-widest"><Eye size={12} /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1 text-steel-dim text-[10px] uppercase tracking-widest"><EyeOff size={12} /> Inactive</span>
                  )}
                  <span className="text-steel-dim text-[10px] uppercase">Order: {item.displayOrder}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-body text-xs text-steel-dim uppercase tracking-widest">
                    {[item.designation, item.country].filter(Boolean).join(" · ")}
                  </p>
                  {item.country && (
                    <ReactCountryFlag countryCode={item.country} svg style={{ width: '1.1em', height: '1.1em' }} />
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(item)} className="p-3 border border-white/10 hover:border-copper/40 hover:text-copper transition-colors">
                  <Edit3 size={16} />
                </button>
                <button type="button" onClick={() => setDeleteId(item._id)} className="p-3 border border-white/10 hover:border-red-500/40 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-carbon/90 backdrop-blur-sm">
          <div className="max-w-md w-full bg-carbon-light border border-white/10 p-8">
            <h4 className="font-heading text-2xl uppercase text-white mb-4">Delete Profile?</h4>
            <p className="font-text text-steel-dim text-sm mb-8">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button type="button" onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-body text-[10px] uppercase tracking-widest">Delete</button>
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-white/10 font-body text-[10px] uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalProfileManagement;

