import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Edit3, Trash2, Upload, X, Eye, EyeOff } from "lucide-react";
import { internationalProfileService } from "../../services/api";

const EMPTY_FORM = {
  fullName: "",
  designation: "",
  country: "",
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

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      fullName: item.fullName || "",
      designation: item.designation || "",
      country: item.country || "",
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
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
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
        } else {
          data.append(key, value);
        }
      });
      if (photoFile) data.append("profilePhoto", photoFile);

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
          className="p-8 border border-white/10 bg-carbon-light space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-2xl uppercase text-white">
              {editId ? "Edit Profile" : "New Profile"}
            </h3>
            <button type="button" onClick={resetForm} className="text-steel-dim hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="space-y-2 block">
              <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Full Name *</span>
              <input name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper" />
            </label>
            <label className="space-y-2 block">
              <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Designation / Title</span>
              <input name="designation" value={formData.designation} onChange={handleChange} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper" />
            </label>
            <label className="space-y-2 block">
              <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Country</span>
              <input name="country" value={formData.country} onChange={handleChange} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper" />
            </label>
            <label className="space-y-2 block">
              <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Display Order</span>
              <input name="displayOrder" type="number" value={formData.displayOrder} onChange={handleChange} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper" />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Short Bio</span>
            <textarea name="shortBio" value={formData.shortBio} onChange={handleChange} rows={2} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper resize-none" />
          </label>

          <label className="space-y-2 block">
            <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Full Article</span>
            <textarea name="fullArticle" value={formData.fullArticle} onChange={handleChange} rows={6} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper resize-y" />
          </label>

          <div className="grid md:grid-cols-2 gap-6">
            {["instagramUrl", "facebookUrl", "twitterUrl", "websiteUrl", "linkedInUrl"].map((field) => (
              <label key={field} className="space-y-2 block">
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">{field.replace("Url", " URL")}</span>
                <input name={field} value={formData[field]} onChange={handleChange} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm outline-none focus:border-copper" />
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="accent-copper" />
              <span className="font-body text-xs uppercase tracking-widest text-steel-dim">Active</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-white/20 cursor-pointer hover:border-copper/40 transition-colors">
              <Upload size={16} className="text-copper" />
              <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim">
                {editId ? "Replace Photo" : "Upload Photo *"}
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover border border-white/10" />
            )}
          </div>

          <div className="flex gap-4">
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
                <p className="font-body text-xs text-steel-dim uppercase tracking-widest mt-1">
                  {[item.designation, item.country].filter(Boolean).join(" · ")}
                </p>
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

