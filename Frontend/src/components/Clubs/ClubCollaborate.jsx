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
  Calendar,
  Zap,
  Trash2,
  Key,
  Mail,
  Phone,
  CheckCircle
} from "lucide-react";
import { clubService, otpService, profileService } from "../../services/api";
import TermsModal from "../TermsModal";
import {
  CLUB_COLLABORATION_TERMS,
  CLUB_COLLABORATION_FINAL_ACCEPTANCE,
} from "../../constants/clubRegistrationTerms";

const DUPLICATE_PHONE_MESSAGE = "This mobile number is already registered.";

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
  otp: "",
  admins: [{ name: "", role: "admin", email: "", phone: "", otp: "" }],
  logo: null,
  firstRideImage: null,
  governmentIdImage: null,
  founderPassport: null,
};

const ClubCollaborate = () => {
  const navigate = useNavigate();
  const userEmail = sessionStorage.getItem("userEmail") || "";
  const userPhone = sessionStorage.getItem("userPhone") || "";

  const [requestForm, setRequestForm] = useState(initialRequestState);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [adminOtpMeta, setAdminOtpMeta] = useState({});
  const [founderPhoneError, setFounderPhoneError] = useState("");

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const updateField = (field, value) =>
    setRequestForm((prev) => ({ ...prev, [field]: value }));

  const updateAdminField = (index, field, value) =>
    setRequestForm((prev) => {
      const admins = [...prev.admins];
      admins[index] = { ...admins[index], [field]: value };
      if (field === "email") {
        admins[index].otp = "";
        setAdminOtpMeta((meta) => ({
          ...meta,
          [index]: { otpSent: false, countdown: 0, isSending: false, verified: false, isVerifying: false },
        }));
      }
      if (field === "otp") {
        setAdminOtpMeta((meta) => ({
          ...meta,
          [index]: { ...(meta[index] || {}), verified: false },
        }));
      }
      return { ...prev, admins };
    });

  const addAdminRow = () =>
    setRequestForm((prev) => ({
      ...prev,
      admins: [
        ...prev.admins,
        { name: "", role: "admin", email: "", phone: "", otp: "" },
      ],
    }));

  const removeAdminRow = (index) =>
    setRequestForm((prev) => ({
      ...prev,
      admins: prev.admins.filter((_, i) => i !== index),
    }));

  const handleFileChange = (field, file) =>
    setRequestForm((prev) => ({ ...prev, [field]: file }));

  const handleSendOtp = async () => {
    const email = userEmail || requestForm.founderEmail;
    if (!email) {
      return toast.error("Please enter founder email first");
    }
    setIsSendingOtp(true);
    try {
      await otpService.send(email, "club_signup");
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendAdminOtp = async (index) => {
    const admin = requestForm.admins[index];
    if (!admin?.email?.trim()) {
      return toast.error("Enter an email address first");
    }
    setAdminOtpMeta((prev) => ({
      ...prev,
      [index]: { ...(prev[index] || {}), isSending: true },
    }));
    try {
      await otpService.send(admin.email.trim(), "club_signup");
      setAdminOtpMeta((prev) => ({
        ...prev,
        [index]: { otpSent: true, countdown: 60, isSending: false, verified: false, isVerifying: false },
      }));
      toast.success(`OTP sent to ${admin.email}!`);
    } catch (error) {
      setAdminOtpMeta((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), isSending: false },
      }));
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyAdminOtp = async (index) => {
    const admin = requestForm.admins[index];
    if (!admin?.email?.trim()) {
      return toast.error("Please enter leadership email first");
    }
    if (!admin?.otp || admin.otp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }
    setAdminOtpMeta((prev) => ({
      ...prev,
      [index]: { ...(prev[index] || {}), isVerifying: true, verified: false },
    }));
    try {
      await otpService.verify(admin.email.trim(), admin.otp, "club_signup");
      setAdminOtpMeta((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), isVerifying: false, verified: true },
      }));
      toast.success(`Leadership email verified: ${admin.email}`);
    } catch (error) {
      setAdminOtpMeta((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), isVerifying: false, verified: false },
      }));
      toast.error(error.response?.data?.message || "Invalid or expired OTP.");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setAdminOtpMeta((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key]?.countdown > 0) {
            next[key] = { ...next[key], countdown: next[key].countdown - 1 };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkPhoneDuplicate = async (phone) => {
    if (!phone || phone.length !== 10) return false;
    try {
      const result = await profileService.checkPhoneRegistered(phone);
      return result.registered;
    } catch {
      return false;
    }
  };

  const handleFounderPhoneBlur = async () => {
    const phone = userPhone || requestForm.founderPhone;
    if (phone?.length === 10 && await checkPhoneDuplicate(phone)) {
      setFounderPhoneError(DUPLICATE_PHONE_MESSAGE);
    } else {
      setFounderPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      return toast.error("Please accept the Declaration & Legal Agreement to proceed.");
    }

    const creatorEmail = userEmail || requestForm.founderEmail;
    const creatorPhone = userPhone || requestForm.founderPhone;

    if (!creatorEmail) {
      return toast.error("Please provide founder email.");
    }
    if (!requestForm.otp) {
      return toast.error("Please enter the OTP sent to your email.");
    }
    if (!otpSent) {
      return toast.error("Please verify your email with OTP first.");
    }

    const founderPhoneValue = userPhone || requestForm.founderPhone;
    if (founderPhoneValue?.length === 10 && await checkPhoneDuplicate(founderPhoneValue)) {
      setFounderPhoneError(DUPLICATE_PHONE_MESSAGE);
      return toast.error(DUPLICATE_PHONE_MESSAGE);
    }

    for (let i = 0; i < requestForm.admins.length; i++) {
      const admin = requestForm.admins[i];
      if (admin.email?.trim()) {
        const meta = adminOtpMeta[i];
        if (!meta?.verified) {
          return toast.error(`Please verify OTP for leadership email: ${admin.email}`);
        }
      }
      if (admin.phone?.length === 10 && await checkPhoneDuplicate(admin.phone)) {
        return toast.error(DUPLICATE_PHONE_MESSAGE);
      }
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
      data.append("creatorEmail", creatorEmail);
      data.append("creatorPhone", creatorPhone);
      data.append("otp", requestForm.otp);
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
      setOtpSent(false);
      setCountdown(0);
      setAdminOtpMeta({});
      setFounderPhoneError("");
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
                 { label: "Please upload your Club Registration ID (or Government-Issued ID of the Club Administrator)", field: "governmentIdImage", icon: <Calendar size={20} /> },
                 { label: "Founder Verification (Document)", field: "founderPassport", icon: <User size={20} /> },
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Founder Email *</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type="email"
                      className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors disabled:opacity-50"
                      value={userEmail || requestForm.founderEmail}
                      onChange={(e) => updateField("founderEmail", e.target.value)}
                      placeholder="founder@club.com"
                      required
                      disabled={!!userEmail || (otpSent && countdown > 0)}
                    />
                  </div>
                  {!userEmail && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || countdown > 0}
                      className="px-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 min-w-[90px]"
                    >
                      {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "SEND OTP"}
                    </button>
                  )}
                </div>
                {userEmail && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || countdown > 0}
                    className="mt-2 px-4 py-3 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50"
                  >
                    {isSendingOtp ? "..." : countdown > 0 ? `Resend OTP in ${countdown}s` : otpSent ? "Resend OTP" : "Send OTP to Account Email"}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Founder Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                  <input
                    type="tel"
                    className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors disabled:opacity-50"
                    value={userPhone || requestForm.founderPhone}
                    onChange={(e) => updateField("founderPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onBlur={handleFounderPhoneBlur}
                    placeholder="10 digit number"
                    disabled={!!userPhone}
                  />
                </div>
                {founderPhoneError && (
                  <p className="font-body text-[10px] text-red-400">{founderPhoneError}</p>
                )}
              </div>
              {otpSent && (
                <div className="space-y-2 md:col-span-2">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">OTP *</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type="text"
                      className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                      value={requestForm.otp}
                      onChange={(e) => updateField("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-copper mb-6">Additional Leadership</h3>
            <div className="space-y-6 mb-8">
              {requestForm.admins.map((admin, index) => {
                const meta = adminOtpMeta[index] || {};
                return (
                <div key={index} className="p-4 md:p-6 border border-white/5 bg-carbon/50 relative group space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      type="tel"
                      className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-xs outline-none focus:border-copper"
                      placeholder="PHONE"
                      value={admin.phone}
                      onChange={(e) => updateAdminField(index, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim block">
                      Leadership Email {admin.email?.trim() ? "*" : ""}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                        <input
                          type="email"
                          className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                          placeholder="leadership@club.com"
                          value={admin.email}
                          onChange={(e) => updateAdminField(index, "email", e.target.value)}
                        />
                      </div>
                      {!meta.verified && (
                        <button
                          type="button"
                          onClick={() => handleSendAdminOtp(index)}
                          disabled={meta.isSending || meta.countdown > 0}
                          className={`px-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 min-w-[90px] ${!admin.email?.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {meta.isSending ? "..." : meta.countdown > 0 ? `${meta.countdown}s` : "SEND OTP"}
                        </button>
                      )}
                    </div>

                    {admin.email?.trim() && meta.verified && (
                      <p className="font-body text-[10px] text-green-400 flex items-center gap-1.5">
                        <CheckCircle size={14} /> Email Verified
                      </p>
                    )}

                    {admin.email?.trim() && !meta.verified && !meta.otpSent && (
                      <p className="font-body text-[10px] text-steel-dim">
                        Click SEND OTP to receive a verification code at this email address.
                      </p>
                    )}

                    {admin.email?.trim() && meta.otpSent && !meta.verified && (
                      <div className="space-y-2">
                        <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim block">OTP *</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-grow">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                            <input
                              type="text"
                              className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                              placeholder="Enter 6-digit OTP"
                              value={admin.otp || ""}
                              onChange={(e) => updateAdminField(index, "otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleVerifyAdminOtp(index)}
                            disabled={meta.isVerifying || admin.otp?.length !== 6}
                            className="px-4 py-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {meta.isVerifying ? "..." : "Verify OTP"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

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
              );})}
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
              disabled={submitting}
              className="w-full md:w-auto px-16 py-6 bg-copper text-carbon font-heading text-2xl uppercase hover:bg-white transition-all duration-500 disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Submit Collaboration Request"}
            </button>
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
