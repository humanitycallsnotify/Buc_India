import React, { useState, useEffect } from "react";
import { X, Camera, FileText, Shield, GraduationCap, Bike, Users, User, Calendar } from "lucide-react";
import { profileService } from "../../services/api";
import { toast } from "react-toastify";

const EditUserModal = ({ isOpen, onClose, user, clubs, onSuccess }) => {
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [editProfileImagePreview, setEditProfileImagePreview] = useState(null);
  const [editLicenseImage, setEditLicenseImage] = useState(null);
  const [editLicenseImagePreview, setEditLicenseImagePreview] = useState(null);

  // Manage body scroll locking when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setEditFormData({
        id: user._id,
        registrationType: user.registrationType || "Rider",
        fullName: user.fullName || "",
        gender: user.gender || "",
        phone: user.phone || "",
        email: user.email || "", // view only
        collegeName: user.collegeName || "",
        collegeIdNo: user.collegeIdNo || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        bloodGroup: user.bloodGroup || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        bikeModel: user.bikeModel || "",
        bikeRegistrationNumber: user.bikeRegistrationNumber || "",
        licenseNumber: user.licenseNumber || "",
        clubId: user.clubId?._id || user.clubId || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactPhone: user.emergencyContactPhone || "",
        facebookUrl: user.facebookUrl || "",
        instagramUrl: user.instagramUrl || "",
        twitterUrl: user.twitterUrl || "",
        youtubeUrl: user.youtubeUrl || "",
        websiteUrl: user.websiteUrl || "",
        tshirtSize: user.tshirtSize || "",
      });
      setEditProfileImagePreview(user.profileImage || null);
      setEditLicenseImagePreview(user.licenseImage || null);
      setEditProfileImage(null);
      setEditLicenseImage(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = new FormData();
      Object.keys(editFormData).forEach((key) => {
        payload.append(key, editFormData[key]);
      });
      if (editProfileImage) {
        payload.append("profileImage", editProfileImage);
      }
      if (editLicenseImage) {
        payload.append("licenseImage", editLicenseImage);
      }

      await profileService.update(payload);
      toast.success("Profile updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-carbon/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      data-lenis-prevent
      onClick={onClose}
    >
      <div 
        className="bg-carbon-light border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-heading text-xl uppercase tracking-wider text-white flex items-center gap-3">
            <Users className="text-copper" size={24} /> Edit User Registration
          </h2>
          <button
            onClick={onClose}
            className="text-steel-dim hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div 
          className="overflow-y-auto p-6 md:p-8 flex-grow space-y-8 max-h-[75vh]"
          data-lenis-prevent
        >
          <form onSubmit={handleEditSubmit} className="space-y-8">
            {/* Visual Assets */}
            {editFormData.registrationType !== "PC" && (
              <div className="space-y-4">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                  <Camera size={14} /> Visual Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Profile Image</label>
                    <div className="flex items-center gap-4 bg-carbon p-4 border border-white/5">
                      {editProfileImagePreview ? (
                        <img src={editProfileImagePreview} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-copper/30" />
                      ) : (
                        <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-full text-steel-dim border border-white/10">
                          <Camera size={20} />
                        </div>
                      )}
                      <label className="cursor-pointer bg-white/5 hover:bg-copper hover:text-carbon text-white font-heading text-[10px] uppercase tracking-widest px-4 py-2 border border-white/10 transition-all font-bold">
                        Change Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setEditProfileImage(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setEditProfileImagePreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                  </div>

                  {/* License Image */}
                  {(editFormData.registrationType === "Rider" || editFormData.registrationType === "Student Rider") && (
                    <div className="space-y-2">
                      <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">License Image</label>
                      <div className="flex items-center gap-4 bg-carbon p-4 border border-white/5">
                        {editLicenseImagePreview ? (
                          <img src={editLicenseImagePreview} alt="License" className="w-16 h-16 object-cover border border-copper/30" />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 flex items-center justify-center text-steel-dim border border-white/10">
                            <FileText size={20} />
                          </div>
                        )}
                        <label className="cursor-pointer bg-white/5 hover:bg-copper hover:text-carbon text-white font-heading text-[10px] uppercase tracking-widest px-4 py-2 border border-white/10 transition-all font-bold">
                          Change Image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setEditLicenseImage(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setEditLicenseImagePreview(reader.result);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                <User size={14} /> Basic Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Full Name</label>
                  <input type="text" value={editFormData.fullName || ""} onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                </div>
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Phone Number</label>
                  <input type="text" value={editFormData.phone || ""} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                </div>
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">T-Shirt Size</label>
                  <select value={editFormData.tshirtSize || ""} onChange={(e) => setEditFormData({...editFormData, tshirtSize: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white appearance-none animate-none" style={{ background: "#111" }} required>
                    <option value="">Select Size</option>
                    {["S", "M", "L", "XL", "XXL", "XXXL"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Gender</label>
                  <select value={editFormData.gender || ""} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white appearance-none animate-none" style={{ background: "#111" }} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefernottosay">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Address (Read-Only)</label>
                  <input type="email" value={editFormData.email || ""} disabled className="w-full bg-carbon/50 border border-white/10 px-4 py-3 font-body text-xs outline-none opacity-50 text-white" />
                </div>
              </div>
            </div>

            {/* Student Details */}
            {(editFormData.registrationType === "Student" || editFormData.registrationType === "Student Rider") && (
              <div className="space-y-4">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                  <GraduationCap size={14} /> Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">College Name</label>
                    <input type="text" value={editFormData.collegeName || ""} onChange={(e) => setEditFormData({...editFormData, collegeName: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Student ID Number</label>
                    <input type="text" value={editFormData.collegeIdNo || ""} onChange={(e) => setEditFormData({...editFormData, collegeIdNo: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                </div>
              </div>
            )}

            {/* Personal Details */}
            {(editFormData.registrationType === "Rider" || editFormData.registrationType === "Student Rider") && (
              <div className="space-y-4">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                  <Calendar size={14} /> Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Date of Birth</label>
                    <input type="date" value={editFormData.dateOfBirth || ""} onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Blood Group</label>
                    <select value={editFormData.bloodGroup || ""} onChange={(e) => setEditFormData({...editFormData, bloodGroup: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white appearance-none animate-none" style={{ background: "#111" }} required>
                      <option value="">Select Blood Group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                <Shield size={14} /> Address Info
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Address</label>
                  <input type="text" value={editFormData.address || ""} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">City</label>
                    <input type="text" value={editFormData.city || ""} onChange={(e) => setEditFormData({...editFormData, city: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">State</label>
                    <input type="text" value={editFormData.state || ""} onChange={(e) => setEditFormData({...editFormData, state: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Pincode</label>
                    <input type="text" value={editFormData.pincode || ""} onChange={(e) => setEditFormData({...editFormData, pincode: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Bike & License Info */}
            {(editFormData.registrationType === "Rider" || editFormData.registrationType === "Student Rider" || editFormData.registrationType === "PC") && (
              <div className="space-y-4">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                  <Bike size={14} /> Bike & License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Bike Model</label>
                    <input type="text" value={editFormData.bikeModel || ""} onChange={(e) => setEditFormData({...editFormData, bikeModel: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Bike Registration Number</label>
                    <input type="text" value={editFormData.bikeRegistrationNumber || ""} onChange={(e) => setEditFormData({...editFormData, bikeRegistrationNumber: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                  {(editFormData.registrationType === "Rider" || editFormData.registrationType === "Student Rider") && (
                    <div className="space-y-1 md:col-span-2">
                      <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">License Number</label>
                      <input type="text" value={editFormData.licenseNumber || ""} onChange={(e) => setEditFormData({...editFormData, licenseNumber: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Club Affiliation */}
            {(editFormData.registrationType === "Rider" || editFormData.registrationType === "Student Rider") && (
              <div className="space-y-4">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                  <Shield size={14} /> Club Affiliation
                </h3>
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Select Associated Club</label>
                  <select value={editFormData.clubId || ""} onChange={(e) => setEditFormData({...editFormData, clubId: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white appearance-none animate-none" style={{ background: "#111" }}>
                    <option value="">None / Not Applicable</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {editFormData.registrationType !== "PC" && (
              <div className="space-y-4">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                  <Shield size={14} /> Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Emergency Contact Name</label>
                    <input type="text" value={editFormData.emergencyContactName || ""} onChange={(e) => setEditFormData({...editFormData, emergencyContactName: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Emergency Contact Phone</label>
                    <input type="text" value={editFormData.emergencyContactPhone || ""} onChange={(e) => setEditFormData({...editFormData, emergencyContactPhone: e.target.value.replace(/\D/g, "").slice(0, 10)})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" required />
                  </div>
                </div>
              </div>
            )}

            {/* Social Presence */}
            {editFormData.registrationType !== "PC" && (
              <div className="space-y-4">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                  <Shield size={14} /> Social Presence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Facebook URL</label>
                    <input type="text" value={editFormData.facebookUrl || ""} onChange={(e) => setEditFormData({...editFormData, facebookUrl: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Instagram URL</label>
                    <input type="text" value={editFormData.instagramUrl || ""} onChange={(e) => setEditFormData({...editFormData, instagramUrl: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Twitter / X URL</label>
                    <input type="text" value={editFormData.twitterUrl || ""} onChange={(e) => setEditFormData({...editFormData, twitterUrl: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">YouTube URL</label>
                    <input type="text" value={editFormData.youtubeUrl || ""} onChange={(e) => setEditFormData({...editFormData, youtubeUrl: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Personal Website URL</label>
                    <input type="text" value={editFormData.websiteUrl || ""} onChange={(e) => setEditFormData({...editFormData, websiteUrl: e.target.value})} className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper transition-colors text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-white/10 hover:border-white/30 hover:bg-white/5 text-white font-heading text-xs uppercase tracking-widest transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-8 py-3 bg-copper hover:bg-white text-carbon font-heading text-xs uppercase tracking-widest transition-all font-bold disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
