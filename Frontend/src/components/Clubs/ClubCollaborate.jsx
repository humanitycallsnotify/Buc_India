import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Shield,
  PlusCircle,
  ArrowLeft,
  Handshake,
  Upload,
  User,
  Mail,
  Phone,
  Calendar,
  Zap,
  Trash2,
  CheckCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clubService } from "../../services/api";
import TermsModal from "../TermsModal";

const CLUB_TERMS = [
  {
    title: "1. Purpose of Collaboration",
    content: "We agree to collaborate with Bikers Unity Calls (BUC_India) to:\n• Promote safe and responsible riding culture\n• Build unity, brotherhood, and community bonding\n• Support social initiatives, awareness campaigns, and events\n\nThis collaboration is non-commercial in nature unless formally agreed otherwise in writing."
  },
  {
    title: "2. Legal Compliance",
    content: "The club agrees to:\n• Follow all Government laws, Traffic rules, and Police regulations\n• Ensure members comply with safety and legal standards during rides/events"
  },
  {
    title: "3. Independent Identity Clause",
    content: "• Each club operates independently\n• This registration does not create any partnership, employment, or legal joint liability\n• Clubs remain responsible for their own internal operations"
  },
  {
    title: "4. Code of Conduct",
    content: "The club and its members agree to:\n• Promote discipline, safety, and respect\n• Avoid stunts, rash riding, illegal gatherings\n• Prohibit alcohol/drug influence during rides\n• Maintain positive representation of biking community"
  },
  {
    title: "5. Safety Commitment",
    content: "All participating members must:\n• Wear mandatory riding gear\n• Follow ride protocols and marshal instructions\n• Prioritize safety over performance or showmanship"
  },
  {
    title: "6. Community & Brotherhood Clause",
    content: "• This collaboration is built on trust, unity, and brotherhood\n• All clubs agree to maintain mutual respect and support\n• No actions should harm the reputation or harmony of the riding community"
  },
  {
    title: "🚫 7. No Claim / No Dispute Clause",
    content: "The club hereby agrees that:\n• No club, member, or representative shall:\n  - Raise complaints\n  - File legal claims\n  - Demand compensation\n\nagainst:\n  - Bikers Unity Calls (BUC_India)\n  - Humanity Calls Trust\n  - UFH Riders\n  - Organizers, volunteers, or associated partners\n\nfor any matter arising from:\n  - Participation in rides/events\n  - Community collaborations\n  - Interactions between clubs\n\nThis agreement is made in the spirit of healthy brotherhood and mutual respect."
  },
  {
    title: "⚠️ 8. Conflict of Interest Clause",
    content: "The club declares that:\n• It will not use this platform for personal, political, or commercial gain without approval\n• It will not promote conflicting or competing interests that harm the community\n• Any conflict must be disclosed immediately\n\nFailure to comply may result in termination of association."
  },
  {
    title: "9. Liability Disclaimer",
    content: "• BUC_India acts only as a community platform\n• It is not responsible for actions, incidents, or disputes involving individual clubs\n• Each club is fully responsible for its members’ conduct and safety"
  },
  {
    title: "10. Indemnity Clause",
    content: "The club agrees to:\n• Indemnify and hold harmless BUC_India and associated entities from:\n  - Claims arising due to club/member actions\n  - Legal issues caused by negligence or misconduct"
  },
  {
    title: "11. Media & Branding Consent",
    content: "The club agrees that:\n• BUC_India may use club name, logo, and visuals for:\n  - Promotions\n  - Social media\n  - Awareness campaigns"
  },
  {
    title: "12. Termination Rights",
    content: "BUC_India reserves the right to:\n• Suspend or remove any club for:\n  - Misconduct\n  - Unsafe activities\n  - Violation of terms\n\nNo explanation or compensation is required."
  },
  {
    title: "13. All Rights Reserved Clause",
    content: "All rights regarding:\n• Event execution\n• Branding\n• Community representation\n• Decision-making\n\nare solely reserved by BUC_India / Humanity Calls Trust"
  },
  {
    title: "14. Final Acceptance",
    content: "We, as a club/community, confirm that:\n• We have read and understood all terms\n• We voluntarily agree to collaborate under these conditions\n• We accept this agreement in the spirit of unity, safety, and brotherhood"
  }
];

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
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [requestForm, setRequestForm] = useState(initialRequestState);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    // Logic to set user details if needed from auth context
  }, []);

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

    const validAdmins = requestForm.admins.filter(admin => admin.name.trim() !== "");
    if (validAdmins.length === 0) {
      return toast.error("Please add at least 1 additional admin.");
    }
    
    if (!requestForm.logo || !requestForm.firstRideImage || !requestForm.governmentIdImage || !requestForm.founderPassport) {
      return toast.error("Please upload all required visual assets.");
    }

    if (!termsAccepted) {
      return toast.error("Please accept the Club Declaration & Legal Agreement to proceed.");
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
      data.append("admins", JSON.stringify(validAdmins));
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
      setIsSuccess(true);
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

        {isSuccess ? (
          <div className="bg-carbon-light border border-white/5 p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="font-heading text-4xl uppercase mb-4 text-white">Registration <span className="text-transparent outline-title">Successful</span></h2>
            <p className="font-text text-steel-dim text-lg max-w-lg mx-auto leading-relaxed mb-8">
              Your club collaboration request has been successfully submitted. The BUC administrators will review your application and respond shortly.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                setRequestForm(initialRequestState);
                setTermsAccepted(false);
              }}
              className="px-8 py-4 bg-copper text-carbon font-heading text-sm uppercase tracking-widest hover:bg-white transition-all duration-300"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Section: Club Information */}
          <div className="bg-carbon-light border border-white/5 p-8 md:p-12">
            <h2 className="font-heading text-3xl uppercase mb-8 flex items-center gap-4">
               <Zap size={24} className="text-copper" />
               Club Identity
            </h2>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Club Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                  value={requestForm.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. APEX PREDATORS MOTORCYCLE CLUB"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Est. Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                    value={requestForm.startedOn}
                    onChange={(e) => updateField("startedOn", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Moto / Tagline <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                    value={requestForm.moto}
                    onChange={(e) => updateField("moto", e.target.value)}
                    placeholder="e.g. HONOR OVER SPEED"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Mission Statement <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                   className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors resize-none"
                  value={requestForm.showcaseText}
                  onChange={(e) => updateField("showcaseText", e.target.value)}
                  placeholder="What does your brotherhood stand for?"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Founder & Leadership */}
          <div className="bg-carbon-light border border-white/5 p-8 md:p-12">
            <h2 className="font-heading text-3xl uppercase mb-8 flex items-center gap-4">
               <User size={24} className="text-copper" />
               Command & Control
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Founder Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                  value={requestForm.founderName}
                  onChange={(e) => updateField("founderName", e.target.value)}
                  placeholder="Lead Founder"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Designation <span className="text-red-500">*</span></label>
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

            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-copper mb-6">Additional Leadership <span className="text-red-500">*</span></h3>
            <div className="space-y-4 mb-8">
              {requestForm.admins.map((admin, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-white/5 bg-carbon/50 relative group">
                  <input
                    type="text"
                    className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper"
                    placeholder="NAME *"
                    value={admin.name}
                    onChange={(e) => updateAdminField(index, "name", e.target.value)}
                    required={index === 0}
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

          {/* Section: Assets & Verification */}
          <div className="bg-carbon-light border border-white/5 p-8 md:p-12">
            <h2 className="font-heading text-3xl uppercase mb-8 flex items-center gap-4">
               <Upload size={24} className="text-copper" />
               Visual Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { label: "Club Insignia (Logo) *", field: "logo", icon: <Shield size={20} /> },
                 { label: "Brotherhood Moment (Ride Photo) *", field: "firstRideImage", icon: <Zap size={20} /> },
                 { label: "Institutional ID (Reg. Doc) *", field: "governmentIdImage", icon: <Calendar size={20} /> },
                 { label: "Founder Verification (Govt ID) *", field: "founderPassport", icon: <User size={20} /> },
               ].map((item) => (
                 <label key={item.field} className="group cursor-pointer">
                    <div className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group-hover:border-copper/50 transition-all duration-500 bg-carbon/30">
                       <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-4 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                          {item.icon}
                       </div>
                       <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-1 group-hover:text-white">
                         {item.label.replace(' *', '')} <span className="text-red-500">*</span>
                       </span>
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

          {/* Declaration & Legal Agreement */}
          <div className="bg-carbon-light border border-white/5 p-8 md:p-12 space-y-6">
            <h2 className="font-heading text-3xl uppercase mb-4 flex items-center gap-4">
              <Shield size={24} className="text-copper" />
              Declaration & Legal Agreement
            </h2>
            
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="acceptClubTerms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 accent-copper bg-carbon border border-white/10 rounded cursor-pointer"
              />
              <label htmlFor="acceptClubTerms" className="font-text text-sm text-steel-dim leading-relaxed cursor-pointer select-none">
                We, as a club/community, confirm that we have read and understood all{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-copper hover:underline hover:text-white transition-all font-semibold"
                >
                  Club Collaboration Terms & Conditions
                </button>
                , voluntarily agree to collaborate under these conditions, and accept this agreement in the spirit of unity, safety, and brotherhood. <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col md:flex-row items-center gap-12 pt-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-16 py-6 bg-copper text-carbon font-heading text-2xl uppercase hover:bg-white transition-all duration-500 disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Submit Collaboration Request"}
            </button>
          </div>
        </form>
        )}
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Club Collaboration"
        subtitle="Club Declaration"
        introText="By registering as a club/community partner with BUC_India, we agree to the following terms:"
        terms={CLUB_TERMS}
        finalAcceptanceItems={[
          "We have read and understood all terms",
          "We voluntarily agree to collaborate under these conditions",
          "We accept this agreement in the spirit of unity, safety, and brotherhood"
        ]}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
          toast.success("Declaration accepted!");
        }}
        acceptButtonText="We Accept & Agree"
      />
    </div>
  );
};

export default ClubCollaborate;
