import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { partnerService } from "../../services/api";
import { toast } from "react-toastify";

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [partnerName, setPartnerName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await partnerService.getAll();
      setPartners(data);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      toast.error("Failed to load partner logos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("name", partnerName || "Partner");

      await partnerService.create(formData);
      toast.success("Partner uploaded successfully");
      closeModal();
      fetchPartners();
    } catch (error) {
      console.error("Failed to upload partner:", error);
      toast.error("Failed to upload partner logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this partner logo?")) return;

    try {
      await partnerService.delete(id);
      toast.success("Partner removed successfully");
      fetchPartners();
    } catch (error) {
      console.error("Failed to delete partner:", error);
      toast.error("Failed to remove partner logo");
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setPreview(null);
    setSelectedFile(null);
    setPartnerName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-carbon-light p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-copper/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="font-heading text-4xl uppercase leading-none text-white">
            Partner <span className="text-copper">Logos</span>
          </h2>
          <p className="font-text text-steel-dim mt-2 tracking-wide">
            Manage the scrolling partner logos displayed on the public website.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="relative px-8 py-3 bg-copper text-carbon font-heading text-sm uppercase tracking-widest hover:bg-white transition-all duration-500 overflow-hidden group self-start md:self-auto shadow-lg shadow-copper/20"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus size={18} />
            Add Partner
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-copper/20 border-t-copper rounded-full animate-spin"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-carbon-light border border-dashed border-white/10 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-carbon border border-white/5 rounded-full flex items-center justify-center mb-6">
            <ImageIcon className="text-steel-dim w-10 h-10 opacity-50" />
          </div>
          <h3 className="font-heading text-2xl text-white uppercase tracking-wider mb-2">No Partners Found</h3>
          <p className="font-text text-steel-dim mb-8">Add partner logos to display them in the scrolling marquee.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 border border-copper/40 text-copper font-body text-xs uppercase tracking-widest hover:bg-copper/10 transition-colors"
          >
            Upload First Logo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {partners.map((partner) => (
            <div
              key={partner._id}
              className="group relative aspect-square bg-white border border-white/10 overflow-hidden hover:border-copper/40 transition-all duration-300 flex items-center justify-center p-6"
            >
              <img
                src={partner.imageUrl}
                alt={partner.name}
                className="max-w-full max-h-full object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
              
              <div className="absolute inset-0 bg-carbon/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                <span className="font-heading text-white uppercase text-center px-4">{partner.name}</span>
                <button
                  onClick={() => handleDelete(partner._id)}
                  className="w-10 h-10 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors"
                  title="Remove Logo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-carbon/90 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-carbon-light border border-white/10 p-8 w-full max-w-md shadow-2xl overflow-hidden">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-steel-dim hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-heading text-2xl text-white uppercase mb-6 flex items-center gap-3">
              <UploadCloud className="text-copper" />
              Upload Partner Logo
            </h3>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block font-body text-xs text-steel-dim uppercase tracking-widest mb-2">Partner Name (Optional)</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="E.g., Brand Name"
                  className="w-full bg-carbon border border-white/10 px-4 py-3 text-white focus:border-copper outline-none transition-colors font-body text-sm"
                />
              </div>
              
              <div>
                <label className="block font-body text-xs text-steel-dim uppercase tracking-widest mb-2">Logo Image</label>
                <div 
                  className="border-2 border-dashed border-white/20 bg-carbon p-6 text-center hover:border-copper/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[150px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <div className="w-full h-full p-4 bg-white/5 flex items-center justify-center rounded">
                      <img src={preview} alt="Preview" className="max-w-full max-h-[120px] object-contain" />
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-steel-dim mb-3" />
                      <p className="font-body text-xs text-steel-dim uppercase tracking-widest">
                        Click to browse file
                      </p>
                      <p className="text-[10px] text-steel-dim mt-2">Format: PNG or transparent background preferred</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isUploading}
                  className="flex-1 py-3 border border-white/10 font-body text-xs uppercase tracking-widest text-steel-dim hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="flex-1 py-3 bg-copper text-carbon font-heading text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUploading ? (
                    <span className="w-5 h-5 border-2 border-carbon/20 border-t-carbon rounded-full animate-spin"></span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManagement;
