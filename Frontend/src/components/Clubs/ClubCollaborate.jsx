import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Shield,
  PlusCircle,
  ArrowLeft,
  Handshake,
  Upload,
  User,
  Calendar,
  Zap,
  Trash2
} from "lucide-react";
import { clubService } from "../../services/api";
import TermsModal from "../TermsModal";
import {
  CLUB_COLLABORATION_TERMS,
  CLUB_COLLABORATION_FINAL_ACCEPTANCE,
} from "../../constants/clubRegistrationTerms";

const initialRequestState = {
  name: "",
  startedOn: "",
  moto: "",
  showcaseText: "",
  governmentIdNumber: "",
  founderName: "",
  founderRole: "founder",
  founderEmail: "",
  founderPhone: "",
  admins: [{ name: "", role: "admin", email: "", phone: "" }],
  logo: null,
  firstRideImage: null,
  governmentIdImage: null,
  founderPassport: null,
};

const ClubCollaborate = () => {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
  const userEmail = sessionStorage.getItem("userEmail") || "";
  const userPhone = sessionStorage.getItem("userPhone") || "";

  const [requestForm, setRequestForm] = useState(initialRequestState);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const updateField = (field, value) =>
    setRequestForm((prev) => ({ ...prev, [field]: value }));

  const updateAdminField = (index, field, value) =>
    setRequestForm((prev) => {
      const admins = [...prev.admins];
      admins[index] = { ...admins[index], [field]: value };
      return { ...prev, admins };
    });

  const addAdminRow = () =>
    setRequestForm((prev) => ({
      ...prev,
      admins: [
        ...prev.admins,
        { name: "", role: "admin", email: "", phone: "" },
      ],
    }));

  const removeAdminRow = (index) =>
    setRequestForm((prev) => ({
      ...prev,
      admins: prev.admins.filter((_, i) => i !== index),
    }));

  const handleFileChange = (field, file) =>
    setRequestForm((prev) => ({ ...prev, [field]: file }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      return toast.error("Please accept the Declaration & Legal Agreement to proceed.");
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", requestForm.name);
      data.append("startedOn", requestForm.startedOn);
      data.append("moto", requestForm.moto);
      data.append("showcaseText", requestForm.showcaseText);
      data.append("governmentIdNumber", requestForm.governmentIdNumber);
      data.append("founderName", requestForm.founderName);
      data.append("founderRole", requestForm.founderRole);
      data.append("founderEmail", requestForm.founderEmail);
      data.append("founderPhone", requestForm.founderPhone);
      data.append("creatorEmail", userEmail || requestForm.founderEmail);
      data.append("creatorPhone", userPhone || requestForm.founderPhone);
      data.append("admins", JSON.stringify(requestForm.admins || []));
      if (requestForm.logo) data.append("logo", requestForm.logo);
      if (requestForm.firstRideImage)
        data.append("firstRideImage", requestForm.firstRideImage);
      if (requestForm.governmentIdImage)
        data.append("governmentIdImage", requestForm.governmentIdImage);
      if (requestForm.founderPassport)
        data.append("founderPassport", requestForm.founderPassport);

      await clubService.createRequest(data);
      toast.success(
        "Request submitted! BUC admin will review and respond shortly."
      );
      setRequestForm(initialRequestState);
      setTermsAccepted(false);
      navigate("/register/june-21-event");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to submit request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <button
            onClick={() => navigate("/register/june-21-event")}
            className="flex items-center gap-2 font-body text-[10px] tracking-widest uppercase text-steel-dim hover:text-copper transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Registration
          </button>
          
          <div className="flex items-end gap-6 mb-4">
             <div className="w-16 h-16 bg-copper/10 border border-copper/30 flex items-center justify-center rounded-full">
                <Handshake size={32} className="text-copper" />
             </div>
             <div>
                <span className="text-copper font-body text-xs tracking-widest uppercase mb-1 block">Partnership</span>
                <h1 className="font-heading text-5xl md:text-7xl uppercase">Collaborate <span className="text-transparent outline-title">With BUC</span></h1>
             </div>
          </div>
          
          <p className="font-text text-steel-dim text-lg max-w-2xl leading-relaxed">
            Unify your brotherhood with the national network. Approved partners gain access to administrative tools, exclusive events, and a dedicated public presence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section: Visual Assets */}
          <div className="bg-carbon-light border border-white/5 p-8 md:p-12">
            <h2 className="font-heading text-3xl uppercase mb-8 flex items-center gap-4">
               <Upload size={24} className="text-copper" />
               Visual Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { label: "Club Insignia (Logo)", field: "logo", icon: <Shield size={20} /> },
                 { label: "Brotherhood Moment (Ride Photo)", field: "firstRideImage", icon: <Zap size={20} /> },
                 { label: "Institutional ID (Reg. Doc)", field: "governmentIdImage", icon: <Calendar size={20} /> },
                 { label: "Founder Verification (Passport)", field: "founderPassport", icon: <User size={20} /> },
               ].map((item) => (
                 <label key={item.field} className="group cursor-pointer">
                    <div className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group-hover:border-copper/50 transition-all duration-500 bg-carbon/30">
                       <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-4 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                          {item.icon}
                       </div>
                       <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-1 group-hover:text-white">{item.label}</span>
                       <span className="font-text text-[9px] text-white/20 truncate max-w-[150px]">
                          {requestForm[item.field] ? requestForm[item.field].name : "Deploy File (IMG, PDF)"}
                       </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(item.field, e.target.files?.[0])}
                    />
                 </label>
               ))}
            </div>
          </div>

          {/* Section: Club Identity */}
          <div className="bg-carbon-light border border-white/5 p-8 md:p-12">
            <h2 className="font-heading text-3xl uppercase mb-8 flex items-center gap-4">
               <Zap size={24} className="text-copper" />
               Club Identity
            </h2>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Club Name *</label>
                <input
                  type="text"
                  className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                  value={requestForm.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="BUC India"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Est. Date</label>
                  <input
                    type="date"
                    className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                    value={requestForm.startedOn}
                    onChange={(e) => updateField("startedOn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Moto / Tagline</label>
                  <input
                    type="text"
                    className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                    value={requestForm.moto}
                    onChange={(e) => updateField("moto", e.target.value)}
                    placeholder="Unity for Humanity"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Mission Statement</label>
                <textarea
                  rows={4}
                   className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors resize-none"
                  value={requestForm.showcaseText}
                  onChange={(e) => updateField("showcaseText", e.target.value)}
                  placeholder="What does your brotherhood stand for?"
                />
              </div>
            </div>
          </div>

          {/* Section: Command & Control */}
          <div className="bg-carbon-light border border-white/5 p-8 md:p-12">
            <h2 className="font-heading text-3xl uppercase mb-8 flex items-center gap-4">
               <User size={24} className="text-copper" />
               Command & Control
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Founder Name</label>
                <input
                  type="text"
                  className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                  value={requestForm.founderName}
                  onChange={(e) => updateField("founderName", e.target.value)}
                  placeholder="Lead Founder"
                />
              </div>
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Designation</label>
                <select
                  className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors appearance-none"
                  value={requestForm.founderRole}
                  onChange={(e) => updateField("founderRole", e.target.value)}
                >
                  <option value="founder">FOUNDER</option>
                  <option value="co-founder">CO-FOUNDER</option>
                  <option value="lead-admin">LEAD ADMIN</option>
                </select>
              </div>
            </div>

            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-copper mb-6">Additional Leadership</h3>
            <div className="space-y-4 mb-8">
              {requestForm.admins.map((admin, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-white/5 bg-carbon/50 relative group">
                  <input
                    type="text"
                    className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper"
                    placeholder="NAME"
                    value={admin.name}
                    onChange={(e) => updateAdminField(index, "name", e.target.value)}
                  />
                  <select
                    className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper"
                    value={admin.role}
                    onChange={(e) => updateAdminField(index, "role", e.target.value)}
                  >
                    <option value="admin">ADMIN</option>
                    <option value="co-founder">CO-FOUNDER</option>
                  </select>
                   <input
                    type="email"
                    className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper"
                    placeholder="EMAIL"
                    value={admin.email}
                    onChange={(e) => updateAdminField(index, "email", e.target.value)}
                  />
                  <input
                    type="tel"
                    className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper"
                    placeholder="PHONE"
                    value={admin.phone}
                    onChange={(e) => updateAdminField(index, "phone", e.target.value)}
                  />
                  {requestForm.admins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdminRow(index)}
                      className="absolute -right-3 -top-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAdminRow}
              className="flex items-center gap-2 text-copper font-body text-[10px] uppercase tracking-widest hover:text-white transition-colors"
            >
              <PlusCircle size={14} />
              Enlist More Leaders
            </button>
          </div>

          {/* Declaration & Legal Agreement */}
          <div className="space-y-6 bg-carbon/50 p-6 border border-white/5 rounded-small">
            <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
              <Shield size={14} /> Declaration & Legal Agreement
            </h3>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptClubTerms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 accent-copper bg-carbon border border-white/10 rounded cursor-pointer"
              />
              <label htmlFor="acceptClubTerms" className="font-text text-xs text-steel-dim leading-relaxed cursor-pointer select-none">
                I confirm that I have read and understood all{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-copper hover:underline hover:text-white transition-all font-semibold"
                >
                  Terms and Conditions
                </button>
                , voluntarily agree to abide by them, and accept full responsibility for our club collaboration. <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col md:flex-row items-center gap-12 pt-8">
            <button
              type="submit"
              disabled={submitting || !isLoggedIn}
              className="w-full md:w-auto px-16 py-6 bg-copper text-carbon font-heading text-2xl uppercase hover:bg-white transition-all duration-500 disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Submit Collaboration Request"}
            </button>
            
            {!isLoggedIn && (
               <div className="flex items-center gap-4 text-red-500 animate-pulse">
                  <Shield size={20} />
                  <span className="font-body text-xs tracking-widest uppercase">AUTHENTICATION REQUIRED</span>
               </div>
            )}
          </div>
        </form>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Club Collaboration"
        subtitle="Declaration & Legal Agreement (Club Level)"
        introText="By registering as a club/community partner with BUC_India, we agree to the following terms:"
        terms={CLUB_COLLABORATION_TERMS}
        finalAcceptanceTitle="14. Final Acceptance"
        finalAcceptanceItems={CLUB_COLLABORATION_FINAL_ACCEPTANCE}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
          toast.success("Declaration accepted!");
        }}
      />
    </div>
  );
};

export default ClubCollaborate;
