import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Trash2, Save } from "lucide-react";
import { siteContentService } from "../services/api";

const SiteContentManagement = () => {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await siteContentService.getHumanityCallsCarousel();
        setImages(data?.images || []);
      } catch (error) {
        toast.error("Failed to load Humanity Calls carousel content");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    const value = newImage.trim();
    if (!value) return;
    setImages((prev) => [...prev, value]);
    setNewImage("");
  };

  const handleUpdateAt = (index, value) => {
    setImages((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleRemoveAt = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const cleaned = images.map((item) => item.trim()).filter(Boolean);
    if (!cleaned.length) {
      toast.error("At least one image URL is required");
      return;
    }

    setSaving(true);
    try {
      const data = await siteContentService.updateHumanityCallsCarousel(cleaned);
      setImages(data?.images || cleaned);
      toast.success("Humanity Calls carousel updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save carousel content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-copper font-body text-[10px] tracking-ultra uppercase mb-2 block font-bold">
          Multi-Site Content
        </span>
        <h2 className="font-heading text-4xl uppercase leading-none text-white">
          Humanity Calls <span className="text-transparent outline-title">Carousel</span>
        </h2>
        <p className="text-steel-dim mt-3 text-sm">
          Manage hero carousel images used on Humanity Calls home page.
        </p>
      </div>

      <div className="border border-white/10 bg-carbon-light p-6 space-y-4">
        <label className="text-xs uppercase tracking-widest text-steel-dim font-bold">
          Add image URL
        </label>
        <div className="flex gap-3">
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-carbon border border-white/10 text-white px-4 py-3 outline-none focus:border-copper"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="btn-metallica flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {images.map((url, index) => (
          <div key={`${url}-${index}`} className="border border-white/10 bg-carbon-light p-5">
            <div className="flex gap-3 items-center mb-4">
              <input
                value={url}
                onChange={(e) => handleUpdateAt(index, e.target.value)}
                className="flex-1 bg-carbon border border-white/10 text-white px-4 py-3 outline-none focus:border-copper"
              />
              <button
                type="button"
                onClick={() => handleRemoveAt(index)}
                className="px-4 py-3 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <img
              src={url}
              alt={`Humanity Calls carousel ${index + 1}`}
              className="w-full h-48 object-cover border border-white/10"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-metallica flex items-center gap-2 disabled:opacity-60"
      >
        <Save size={16} />
        {saving ? "Saving..." : "Save Carousel Changes"}
      </button>
    </div>
  );
};

export default SiteContentManagement;
