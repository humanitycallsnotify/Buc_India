import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";
import { eventService, registrationService, profileService, otpService } from "../../services/api";
import { TERMS_SUMMARY } from "../../constants/registrationConstants";
import {
  resolveRegistrationConfig,
  isFieldEnabled,
  isFieldRequired,
  isDeclarationRequired,
  isEmailOtpEnabled,
  computeAgeFromDob,
  isRegistrationWindowOpen,
  getRemainingSeats,
} from "../../constants/eventRegistrationConfig";
import CustomQuestionsSection from "./CustomQuestionsSection.jsx";
import EventShareModal from "../EventShare/EventShareModal.jsx";
import {
  applyProfileToForm,
  buildRegistrationErrors,
  getDeclarationText,
} from "./eventRegisterFormUtils.js";
import { buildEventRegistrationFormData } from "./eventRegisterSubmitUtils.js";
import {
  User,
  Mail,
  Phone,
  Bike,
  Droplets,
  CheckCircle2,
  CheckCircle,
  X,
  Loader2,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  Zap,
  Share2,
} from "lucide-react";
import "./PublicRegister.css";

const EVENT_OTP_TYPE = "event_registration";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => EMAIL_REGEX.test(String(email || "").trim());

const RegField = ({ fieldKey, regConfig, children, className = "form-group" }) =>
  isFieldEnabled(regConfig, fieldKey) ? <div className={className}>{children}</div> : null;

const fieldLabel = (regConfig, fieldKey, text) =>
  `${text}${isFieldRequired(regConfig, fieldKey) || regConfig.isLegacy ? " *" : ""}`;

const sectionVisible = (regConfig, keys) =>
  regConfig.isLegacy || keys.some((key) => isFieldEnabled(regConfig, key));

const INITIAL_FORM = {
  registrationType: "rider",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  bikeModel: "",
  bikeRegistrationNumber: "",
  licenseNumber: "",
  licenseImage: null,
  profileImage: null,
  dateOfBirth: "",
  gender: "",
  bikeBrand: "",
  ridingExperience: "",
  clubName: "",
  aadhaarNumber: "",
  allergies: "",
  insurance: "",
  bloodGroup: "",
  anyMedicalCondition: "",
  tShirtSize: "",
  requestRidingGears: false,
  requestedGears: {
    helmet: false,
    gloves: false,
    jacket: false,
    boots: false,
    kneeGuards: false,
    elbowGuards: false,
  },
  hasLinkedPillion: false,
  linkedPillionName: "",
  linkedPillionMobile: "",
  linkedPillionTShirtSize: "",
  riderPhone: "",
  riderRegistrationId: "",
  acceptedTerms: false,
  otp: "",
};

const getCategoryIcon = (category) => {
  switch (category) {
    case "Registration": return "📋";
    case "Parking": return "🅿️";
    case "Breakfast": return "🍳";
    case "Ride Start": return "🏍️";
    case "Fuel Stop": return "⛽";
    case "Games": return "🎯";
    case "Photography": return "📸";
    case "Lunch": return "🍔";
    case "Awards": return "🏆";
    case "Closing": return "🏁";
    default: return "📍";
  }
};

const PublicRegister = () => {
  const { eventId: routeEventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [customAnswers, setCustomAnswers] = useState({});
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const regConfig = useMemo(() => resolveRegistrationConfig(event), [event]);
  const computedAge = useMemo(() => computeAgeFromDob(formData.dateOfBirth), [formData.dateOfBirth]);
  const declarationText = useMemo(
    () => getDeclarationText(regConfig.settings) || TERMS_SUMMARY,
    [regConfig.settings],
  );

  const eventId = event ? event._id : (routeEventId || "community");

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split("T")[0];
  }, []);

  const loadEvent = useCallback(async (silent = false) => {
    const lookupId = routeEventId || "community";
    if (lookupId === "community") {
      setEvent({ title: "BUC India Registration", _id: "community" });
      if (!silent) setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const allEvents = await eventService.getAll();
      const slugify = (text) =>
        text.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "")
          .replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
      const found = allEvents.find((e) => e._id === lookupId || slugify(e.title) === lookupId);
      if (found) setEvent(found);
      else if (!silent) setEvent({ title: lookupId, _id: lookupId });
    } catch {
      if (!silent) setError("Failed to load event details");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [routeEventId]);

  useEffect(() => {
    const userLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    const userEmail = sessionStorage.getItem("userEmail");
    const userPhone = sessionStorage.getItem("userPhone");
    
    const fetchProfile = async () => {
      if (userLoggedIn && (userEmail || userPhone)) {
        try {
          const profile = await profileService.get(userEmail, userPhone);
          if (profile) {
            setProfileData(profile);
            setFormData((prev) => applyProfileToForm(profile, prev));
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setFormData((prev) => ({
            ...prev,
            email: userEmail || prev.email,
            phone: userPhone || prev.phone,
          }));
        }
      }
    };

    fetchProfile();
    loadEvent();
  }, [routeEventId, loadEvent]);

  useEffect(() => {
    if (!routeEventId || routeEventId === "community") return undefined;
    const refresh = () => loadEvent(true);
    window.addEventListener("focus", refresh);
    const interval = setInterval(refresh, 15000);
    return () => {
      window.removeEventListener("focus", refresh);
      clearInterval(interval);
    };
  }, [routeEventId, loadEvent]);

  const lookupUserProfile = async (email, phone) => {
    if (!email && !phone) return;
    try {
      const profile = await profileService.get(email, phone);
      if (profile) {
        setProfileData(profile);
        setFormData((prev) => applyProfileToForm(profile, prev));
        toast.info("Profile loaded — you can edit before submitting.");
      }
    } catch (err) {
      console.error("Profile lookup failed:", err);
    }
  };

  const showEmailOtp = isEmailOtpEnabled(regConfig);
  const canSendEmailOtp =
    showEmailOtp &&
    !emailOtpVerified &&
    isValidEmail(formData.email) &&
    !otpLoading;

  const handleSendEmailOtp = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      toast.error("Enter a valid email address first.");
      return;
    }
    setOtpLoading(true);
    try {
      await otpService.send(formData.email, EVENT_OTP_TYPE);
      setEmailOtpSent(true);
      toast.success("OTP sent to your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!formData.otp) {
      toast.error("Enter OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      await otpService.verify(formData.email, formData.otp, EVENT_OTP_TYPE);
      setEmailOtpVerified(true);
      setVerifiedEmail(formData.email.trim().toLowerCase());
      toast.success("Email verified.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "licenseImage") {
      setFormData((prev) => ({ ...prev, licenseImage: files[0] }));
    } else if (name === "profileImage") {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "email") {
      const shouldResetOtp =
        emailOtpVerified &&
        value.trim().toLowerCase() !== verifiedEmail.trim().toLowerCase();
      if (shouldResetOtp) {
        setEmailOtpVerified(false);
        setEmailOtpSent(false);
        setVerifiedEmail("");
      }
      setFormData((prev) => ({
        ...prev,
        email: value,
        ...(shouldResetOtp ? { otp: "" } : {}),
      }));
    } else if (
      name === "phone" ||
      name === "emergencyContactPhone" ||
      name === "riderPhone" ||
      name === "linkedPillionMobile"
    ) {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, registrationType: type }));
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const windowCheck = isRegistrationWindowOpen(regConfig.settings, event);
    if (!windowCheck.open) {
      setError(windowCheck.message);
      toast.error(windowCheck.message);
      return;
    }
    const remaining = getRemainingSeats(event);
    if (remaining === 0) {
      const msg = "This event is full.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const { errors, blocked } = buildRegistrationErrors({
      formData,
      regConfig,
      profileData,
      customAnswers,
      emailOtpVerified,
    });

    if (blocked) {
      setError(blocked);
      toast.error(blocked);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill all mandatory fields");
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0] || document.querySelector(`[name="${firstErrorField}"]`);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setError("");

    const data = buildEventRegistrationFormData({
      formData,
      regConfig,
      eventId,
      customAnswers,
      registrationStatus:
        remaining === 1 && regConfig.settings.waitingListEnabled ? "waiting" : undefined,
    });

    try {
      await registrationService.create(data);
      
      if (formData.email) sessionStorage.setItem("userEmail", formData.email);
      if (formData.phone) sessionStorage.setItem("userPhone", formData.phone);
      
      setShowSuccessOverlay(true);
      toast.success("Registration successful!");
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const errorMessage =
        apiMessage && !/cast to string failed|CastError|validation failed/i.test(apiMessage)
          ? apiMessage
          : "Please check the highlighted fields and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="reg-loading">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="public-register">
      {/* Floating Back Button */}
      <button
        className="back-btn-float"
        onClick={() => navigate("/events")}
        title="Back to home"
      >
        <X size={24} />
      </button>

      <div className="register-container">
        {/* BUC India Header Logo */}
        <div className="buc-logo-container">
          <div className="logo-text-wrapper">
            <span className="logo-main font-heading">BUC INDIA</span>
            <span className="logo-sub">UNITED RIDERS. ONE COMMUNITY.</span>
          </div>
        </div>

        <div className="register-header">
          <span className="ride-badge">OFFICIAL RIDE IN</span>
          <h1 className="hero-title">{event ? event.title : "EVENT REGISTRATION"}</h1>
          <p className="hero-tagline">One ride. One passion. One community. Join us for an unforgettable journey.</p>
        </div>

        {/* Admin Event Banner Poster */}
        {event && eventId !== "community" && event.banner && (
          <div className="admin-event-banner-container">
            <img src={event.banner} alt={event.title} className="admin-event-banner-img" />
          </div>
        )}

        {/* Event Details Card */}
        {event && eventId !== "community" && (
          <div className="event-details-card bg-carbon-light border border-white/5 p-6 rounded-xl shadow-lg relative">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <h3 className="event-details-title font-heading text-2xl text-copper uppercase">{event.title}</h3>
                {event.description && <p className="event-details-desc font-text text-steel-dim text-sm mt-2">{event.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-copper/30 rounded text-copper font-body text-xs hover:bg-copper hover:text-carbon transition-all uppercase tracking-wider shrink-0"
              >
                <Share2 size={12} /> Share Event
              </button>
            </div>
            <div className="event-details-grid grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
              {event.eventDate && (
                <div className="event-detail-item flex items-center gap-2">
                  <span className="detail-label text-copper font-bold">Date:</span>
                  <span className="detail-value text-white">
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {event.eventTime && (
                <div className="event-detail-item flex items-center gap-2">
                  <span className="detail-label text-copper font-bold">Time:</span>
                  <span className="detail-value text-white">{event.eventTime}</span>
                </div>
              )}
              {event.location && (
                <div className="event-detail-item flex items-center gap-2">
                  <span className="detail-label text-copper font-bold">Location:</span>
                  <span className="detail-value text-white">{event.location}</span>
                </div>
              )}
              {event.meetingPoint && (
                <div className="event-detail-item flex items-center gap-2">
                  <span className="detail-label text-copper font-bold">Meeting Point:</span>
                  <span className="detail-value text-white">{event.meetingPoint}</span>
                </div>
              )}
              {getRemainingSeats(event) !== null && (
                <div className="event-detail-item flex items-center gap-2">
                  <span className="detail-label text-copper font-bold">Seats Left:</span>
                  <span className="detail-value text-white font-semibold">
                    {getRemainingSeats(event) > 0 ? `${getRemainingSeats(event)} seats` : "Sold Out"}
                  </span>
                </div>
              )}
              {(regConfig.settings.registrationOpenDate || regConfig.settings.registrationCloseDate) && (
                <div className="event-detail-item flex items-center gap-2 sm:col-span-2">
                  <span className="detail-label text-copper font-bold">Registration Window:</span>
                  <span className="detail-value text-white">
                    {regConfig.settings.registrationOpenDate ? new Date(regConfig.settings.registrationOpenDate).toLocaleDateString() : "Immediate"} - {regConfig.settings.registrationCloseDate ? new Date(regConfig.settings.registrationCloseDate).toLocaleDateString() : "Close"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Itinerary Timeline */}
        {event && event.itinerary && event.itinerary.length > 0 && (
          <div className="itinerary-timeline-container bg-carbon-light border border-white/5 p-6 rounded-xl shadow-lg mb-8">
            <h3 className="font-heading text-xl uppercase text-copper mb-6 tracking-wider border-b border-white/5 pb-2">
              Event Itinerary
            </h3>
            <div className="vertical-timeline pl-4 border-l-2 border-copper/30 space-y-8">
              {event.itinerary.map((item, index) => (
                <div key={index} className="timeline-item relative pl-8">
                  <div className="timeline-badge-icon absolute -left-12 top-1 w-8 h-8 rounded-full bg-carbon border border-copper/40 flex items-center justify-center text-sm shadow-md">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-time text-xs font-bold text-copper uppercase tracking-wider block mb-1">
                      🕗 {item.time} &bull; {item.category}
                    </span>
                    <h4 className="timeline-title text-base font-semibold text-white">{item.title}</h4>
                    {item.description && <p className="timeline-desc text-sm text-steel-dim mt-1 leading-relaxed">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Gallery */}
        {event && event.gallery && event.gallery.length > 0 && (
          <div className="event-gallery-container bg-carbon-light border border-white/5 p-6 rounded-xl shadow-lg mb-8">
            <h3 className="font-heading text-xl uppercase text-copper mb-6 tracking-wider border-b border-white/5 pb-2">
              Event Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {event.gallery.map((img, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setLightboxIndex(index);
                    setShowLightbox(true);
                  }}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-carbon cursor-pointer hover:border-copper/50 transition-all duration-300 shadow-md"
                >
                  <img src={img.url} alt={`Gallery ${index}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-carbon/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs uppercase tracking-widest font-bold border-b border-copper pb-1">View Image</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {showLightbox && event && event.gallery && (
          <div
            className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
            onClick={() => setShowLightbox(false)}
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-6 right-6 text-white hover:text-copper transition-colors z-50 p-2"
              title="Close Lightbox"
            >
              <X size={36} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === 0 ? event.gallery.length - 1 : prev - 1));
              }}
              className="absolute left-6 text-white hover:text-copper transition-colors z-50 p-4 bg-white/5 hover:bg-white/10 rounded-full text-2xl font-bold"
              title="Previous"
            >
              &larr;
            </button>
            <div
              className="max-w-[90vw] max-h-[85vh] flex items-center justify-center relative z-40"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={event.gallery[lightboxIndex]?.url}
                alt={`Lightbox image ${lightboxIndex}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10"
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === event.gallery.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-6 text-white hover:text-copper transition-colors z-50 p-4 bg-white/5 hover:bg-white/10 rounded-full text-2xl font-bold"
              title="Next"
            >
              &rarr;
            </button>
          </div>
        )}

        <div className="registration-card-wrapper">
          <form onSubmit={handleSubmit} className="registration-form" noValidate>
            {error && <div className="error-message">{error}</div>}

            {/* Registration Type Selection */}
            <div className="form-section">
              <h3>Registration Type *</h3>
              <div className="reg-type-container">
                <button
                  type="button"
                  onClick={() => handleTypeChange("rider")}
                  className={`reg-type-btn ${
                    formData.registrationType === "rider" ? "active" : ""
                  }`}
                >
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("pillion")}
                  className={`reg-type-btn ${
                    formData.registrationType === "pillion" ? "active" : ""
                  }`}
                >
                  Pillion
                </button>
              </div>
            </div>
            
            {/* 1. Personal Information */}
            {sectionVisible(regConfig, [
              "fullName", "dob", "age", "gender", "mobile", "email",
              "city", "state", "bloodGroup", "idUpload",
            ]) && (
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <RegField fieldKey="idUpload" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "idUpload", "Profile Picture")}</label>
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleInputChange}
                    className={fieldErrors.profileImage ? "input-error" : ""}
                  />
                  {formData.profileImage ? (
                    <p className="file-selected">✓ New profile picture selected</p>
                  ) : profileData?.profileImage ? (
                    <p className="file-selected text-green-500">✓ Using existing profile picture</p>
                  ) : null}
                  {fieldErrors.profileImage && (
                    <span className="field-error">{fieldErrors.profileImage}</span>
                  )}
                </RegField>
              </div>

              <div className="form-row">
                <RegField fieldKey="fullName" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "fullName", "Full Name")}</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={fieldErrors.fullName ? "input-error" : ""}
                  />
                  {fieldErrors.fullName && (
                    <span className="field-error">{fieldErrors.fullName}</span>
                  )}
                </RegField>
                
                <RegField fieldKey="email" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "email", "Email")}</label>
                  <div className="email-otp-row">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => {
                        if (formData.email?.includes("@") || formData.phone?.length === 10) {
                          lookupUserProfile(formData.email, formData.phone);
                        }
                      }}
                      placeholder="your.email@example.com"
                      className={fieldErrors.email ? "input-error" : ""}
                      disabled={showEmailOtp && emailOtpVerified}
                      readOnly={showEmailOtp && emailOtpVerified}
                    />
                    {showEmailOtp && !emailOtpVerified && !emailOtpSent && canSendEmailOtp && (
                      <button
                        type="button"
                        className="email-otp-btn"
                        onClick={handleSendEmailOtp}
                        disabled={otpLoading}
                      >
                        {otpLoading ? "..." : "Send OTP"}
                      </button>
                    )}
                  </div>
                  {showEmailOtp && emailOtpVerified && (
                    <p className="email-verified-badge">
                      <CheckCircle size={14} /> Email Verified
                    </p>
                  )}
                  {showEmailOtp && emailOtpSent && !emailOtpVerified && (
                    <div className="email-otp-verify-block">
                      <label className="email-otp-verify-label">OTP</label>
                      <div className="email-otp-row">
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleInputChange}
                          placeholder="6-digit OTP"
                          maxLength="6"
                          className="email-otp-input"
                        />
                        <button
                          type="button"
                          className="email-otp-btn email-otp-btn-primary"
                          onClick={handleVerifyEmailOtp}
                          disabled={otpLoading || formData.otp?.length !== 6}
                        >
                          {otpLoading ? "..." : "Verify OTP"}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="email-otp-resend"
                        onClick={handleSendEmailOtp}
                        disabled={otpLoading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                  {fieldErrors.email && (
                    <span className="field-error">{fieldErrors.email}</span>
                  )}
                </RegField>
              </div>

              <div className="form-row">
                <RegField fieldKey="mobile" regConfig={regConfig}>
                  <label>
                    {fieldLabel(regConfig, "mobile", "Phone Number")}{" "}
                    <span className="label-hint">(10-digit Indian mobile)</span>
                  </label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={() => {
                        if (formData.phone?.length === 10 || formData.email?.includes("@")) {
                          lookupUserProfile(formData.email, formData.phone);
                        }
                      }}
                      placeholder="9876543210"
                      className={fieldErrors.phone ? "input-error" : ""}
                      maxLength="10"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <span className="field-error">{fieldErrors.phone}</span>
                  )}
                </RegField>

                <RegField fieldKey="dob" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "dob", "Date of Birth")}</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    max={maxDate}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={fieldErrors.dateOfBirth ? "input-error" : ""}
                  />
                  {fieldErrors.dateOfBirth && (
                    <span className="field-error">{fieldErrors.dateOfBirth}</span>
                  )}
                </RegField>
              </div>

              <div className="form-row">
                <RegField fieldKey="age" regConfig={regConfig}>
                  <label>Age</label>
                  <input
                    type="text"
                    name="age"
                    value={computedAge ?? ""}
                    readOnly
                    placeholder="Calculated from DOB"
                    className="opacity-80"
                  />
                </RegField>

                <RegField fieldKey="gender" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "gender", "Gender")}</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={fieldErrors.gender ? "input-error" : ""}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {fieldErrors.gender && (
                    <span className="field-error">{fieldErrors.gender}</span>
                  )}
                </RegField>
              </div>

              <div className="form-row">
                <RegField fieldKey="bloodGroup" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "bloodGroup", "Blood Group")}</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className={fieldErrors.bloodGroup ? "input-error" : ""}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {fieldErrors.bloodGroup && (
                    <span className="field-error">{fieldErrors.bloodGroup}</span>
                  )}
                </RegField>

                {formData.registrationType === "pillion" && (
                <div className="form-group">
                  <label>T-Shirt Size *</label>
                  <select
                    name="tShirtSize"
                    value={formData.tShirtSize}
                    onChange={handleInputChange}
                    className={fieldErrors.tShirtSize ? "input-error" : ""}
                  >
                    <option value="">Select Size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                  {fieldErrors.tShirtSize && (
                    <span className="field-error">{fieldErrors.tShirtSize}</span>
                  )}
                </div>
                )}
              </div>

              {(regConfig.isLegacy || isFieldEnabled(regConfig, "city") || isFieldEnabled(regConfig, "state")) && (
              <div className="form-row">
                <RegField fieldKey="city" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "city", "City")}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className={fieldErrors.city ? "input-error" : ""}
                  />
                  {fieldErrors.city && (
                    <span className="field-error">{fieldErrors.city}</span>
                  )}
                </RegField>
                <RegField fieldKey="state" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "state", "State")}</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className={fieldErrors.state ? "input-error" : ""}
                  />
                  {fieldErrors.state && (
                    <span className="field-error">{fieldErrors.state}</span>
                  )}
                </RegField>
              </div>
              )}
            </div>
            )}

            {/* 2. Address (legacy events only) */}
            {regConfig.isLegacy && (
            <div className="form-section">
              <h3>Address</h3>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Street address"
                  className={fieldErrors.address ? "input-error" : ""}
                />
                {fieldErrors.address && (
                  <span className="field-error">{fieldErrors.address}</span>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className={fieldErrors.pincode ? "input-error" : ""}
                  />
                  {fieldErrors.pincode && (
                    <span className="field-error">{fieldErrors.pincode}</span>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* 3. Emergency Contact */}
            {sectionVisible(regConfig, ["emergencyContact"]) && (
            <div className="form-section">
              <h3>Emergency Contact</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>{fieldLabel(regConfig, "emergencyContact", "Emergency Contact Name")}</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    placeholder="Contact person name"
                    className={fieldErrors.emergencyContactName ? "input-error" : ""}
                  />
                  {fieldErrors.emergencyContactName && (
                    <span className="field-error">{fieldErrors.emergencyContactName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>{fieldLabel(regConfig, "emergencyContact", "Emergency Contact Phone")}</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className={fieldErrors.emergencyContactPhone ? "input-error" : ""}
                      maxLength="10"
                    />
                  </div>
                  {fieldErrors.emergencyContactPhone && (
                    <span className="field-error">{fieldErrors.emergencyContactPhone}</span>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Rider specific fields */}
            {formData.registrationType === "rider" && sectionVisible(regConfig, [
              "bikeBrand", "bikeModel", "bikeRegistrationNumber", "ridingExperience",
              "ridingClub", "aadhaar", "drivingLicence", "licenceUpload",
            ]) && (
              <>
                {/* 4. Bike Information */}
                <div className="form-section">
                  <h3>Bike Information</h3>
                  <div className="form-row">
                    <RegField fieldKey="bikeBrand" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "bikeBrand", "Bike Brand")}</label>
                      <input
                        type="text"
                        name="bikeBrand"
                        value={formData.bikeBrand}
                        onChange={handleInputChange}
                        placeholder="e.g., Royal Enfield"
                        className={fieldErrors.bikeBrand ? "input-error" : ""}
                      />
                      {fieldErrors.bikeBrand && (
                        <span className="field-error">{fieldErrors.bikeBrand}</span>
                      )}
                    </RegField>
                    <RegField fieldKey="bikeModel" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "bikeModel", "Bike Model")}</label>
                      <input
                        type="text"
                        name="bikeModel"
                        value={formData.bikeModel}
                        onChange={handleInputChange}
                        placeholder="e.g., Royal Enfield Classic 350"
                        className={fieldErrors.bikeModel ? "input-error" : ""}
                      />
                      {fieldErrors.bikeModel && (
                        <span className="field-error">{fieldErrors.bikeModel}</span>
                      )}
                    </RegField>
                  </div>
                  <div className="form-row">
                    <RegField fieldKey="bikeRegistrationNumber" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "bikeRegistrationNumber", "Bike Registration Number")}</label>
                      <input
                        type="text"
                        name="bikeRegistrationNumber"
                        value={formData.bikeRegistrationNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., TN01AB1234"
                        className={fieldErrors.bikeRegistrationNumber ? "input-error" : ""}
                      />
                      {fieldErrors.bikeRegistrationNumber && (
                        <span className="field-error">{fieldErrors.bikeRegistrationNumber}</span>
                      )}
                    </RegField>
                    <RegField fieldKey="ridingExperience" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "ridingExperience", "Riding Experience")}</label>
                      <input
                        type="text"
                        name="ridingExperience"
                        value={formData.ridingExperience}
                        onChange={handleInputChange}
                        placeholder="Years / experience level"
                        className={fieldErrors.ridingExperience ? "input-error" : ""}
                      />
                      {fieldErrors.ridingExperience && (
                        <span className="field-error">{fieldErrors.ridingExperience}</span>
                      )}
                    </RegField>
                  </div>
                  <div className="form-row">
                    <RegField fieldKey="ridingClub" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "ridingClub", "Riding Club")}</label>
                      <input
                        type="text"
                        name="clubName"
                        value={formData.clubName}
                        onChange={handleInputChange}
                        placeholder="Club name (if any)"
                        className={fieldErrors.clubName ? "input-error" : ""}
                      />
                      {fieldErrors.clubName && (
                        <span className="field-error">{fieldErrors.clubName}</span>
                      )}
                    </RegField>
                    <RegField fieldKey="aadhaar" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "aadhaar", "Aadhaar Number")}</label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleInputChange}
                        placeholder="12-digit Aadhaar"
                        className={fieldErrors.aadhaarNumber ? "input-error" : ""}
                      />
                      {fieldErrors.aadhaarNumber && (
                        <span className="field-error">{fieldErrors.aadhaarNumber}</span>
                      )}
                    </RegField>
                  </div>
                  <div className="form-row">
                    <RegField fieldKey="drivingLicence" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "drivingLicence", "License Number")}</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="Driving license number"
                        className={fieldErrors.licenseNumber ? "input-error" : ""}
                      />
                      {fieldErrors.licenseNumber && (
                        <span className="field-error">{fieldErrors.licenseNumber}</span>
                      )}
                    </RegField>
                    <RegField fieldKey="licenceUpload" regConfig={regConfig}>
                      <label>{fieldLabel(regConfig, "licenceUpload", "License Proof (Photo)")}</label>
                      <input
                        type="file"
                        name="licenseImage"
                        accept="image/*"
                        onChange={handleInputChange}
                        className={fieldErrors.licenseImage ? "input-error" : ""}
                      />
                      {formData.licenseImage ? (
                        <p className="file-selected">✓ New license proof selected</p>
                      ) : profileData?.licenseImage ? (
                        <p className="file-selected text-green-500">✓ Using existing license proof</p>
                      ) : null}
                      {fieldErrors.licenseImage && (
                        <span className="field-error">{fieldErrors.licenseImage}</span>
                      )}
                    </RegField>
                  </div>
                </div>

                {/* 5. Riding Gears Request */}
                <div className="form-section">
                  <h3>Riding Gears Request</h3>
                  <div className="form-group">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requestRidingGears"
                        checked={formData.requestRidingGears}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requestRidingGears: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span>Request riding gears for this event</span>
                    </label>
                    {formData.requestRidingGears && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(formData.requestedGears).map((gear) => (
                          <label
                            key={gear}
                            className="flex items-center space-x-2 cursor-pointer bg-white/5 p-3 rounded-lg border border-white/10 hover:border-blue-500/50 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={formData.requestedGears[gear]}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  requestedGears: {
                                    ...formData.requestedGears,
                                    [gear]: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-white capitalize">
                              {gear.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pillion Management */}
                <div className="form-section">
                  <h3>Pillion Management</h3>
                  <div className="reg-terms-check-container mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasLinkedPillion"
                        checked={formData.hasLinkedPillion}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-blue-500"
                      />
                      <span className="text-gray-300 text-sm leading-relaxed">
                        Add a pillion with this rider registration
                      </span>
                    </label>
                  </div>

                  {formData.hasLinkedPillion && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Pillion Name *</label>
                          <input
                            type="text"
                            name="linkedPillionName"
                            value={formData.linkedPillionName}
                            onChange={handleInputChange}
                            placeholder="Enter pillion's name"
                            className={fieldErrors.linkedPillionName ? "input-error" : ""}
                          />
                          {fieldErrors.linkedPillionName && (
                            <span className="field-error">{fieldErrors.linkedPillionName}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Pillion Mobile Number *</label>
                          <div className="phone-input-wrapper">
                            <span className="phone-prefix">+91</span>
                            <input
                              type="tel"
                              name="linkedPillionMobile"
                              value={formData.linkedPillionMobile}
                              onChange={handleInputChange}
                              placeholder="9876543210"
                              className={fieldErrors.linkedPillionMobile ? "input-error" : ""}
                              maxLength="10"
                            />
                          </div>
                          {fieldErrors.linkedPillionMobile && (
                            <span className="field-error">{fieldErrors.linkedPillionMobile}</span>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Pillion T-Shirt Size *</label>
                          <select
                            name="linkedPillionTShirtSize"
                            value={formData.linkedPillionTShirtSize}
                            onChange={handleInputChange}
                            className={fieldErrors.linkedPillionTShirtSize ? "input-error" : ""}
                          >
                            <option value="">Select Size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                          {fieldErrors.linkedPillionTShirtSize && (
                            <span className="field-error">{fieldErrors.linkedPillionTShirtSize}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Pillion specific fields */}
            {formData.registrationType === "pillion" && (
              <div className="form-section">
                <h3>Map to Rider</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rider Mobile Number *</label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">+91</span>
                      <input
                        type="tel"
                        name="riderPhone"
                        value={formData.riderPhone}
                        onChange={handleInputChange}
                        placeholder="Registered rider mobile"
                        className={fieldErrors.riderPhone ? "input-error" : ""}
                        maxLength="10"
                      />
                    </div>
                    {fieldErrors.riderPhone && (
                      <span className="field-error">{fieldErrors.riderPhone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Rider Registration ID (Optional)</label>
                    <input
                      type="text"
                      name="riderRegistrationId"
                      value={formData.riderRegistrationId}
                      onChange={handleInputChange}
                      placeholder="e.g., 60c72b2f9b1d8e25d48723c4"
                      className={fieldErrors.riderRegistrationId ? "input-error" : ""}
                    />
                    {fieldErrors.riderRegistrationId && (
                      <span className="field-error">{fieldErrors.riderRegistrationId}</span>
                    )}
                    <span className="label-hint">Provide Rider's Phone or Registration ID (or both) to map yourself to them.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Medical & Additional */}
            {sectionVisible(regConfig, ["medicalConditions", "allergies", "insurance"]) && (
            <div className="form-section">
              <h3>Medical Information</h3>
              <RegField fieldKey="medicalConditions" regConfig={regConfig}>
                <label>
                  {fieldLabel(regConfig, "medicalConditions", "Medical Conditions (if any)")}
                  <span className="label-hint"> — Write &apos;None&apos; if not applicable</span>
                </label>
                <textarea
                  name="anyMedicalCondition"
                  value={formData.anyMedicalCondition}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Please mention any medical conditions"
                  className={fieldErrors.anyMedicalCondition ? "input-error" : ""}
                />
                {fieldErrors.anyMedicalCondition && (
                  <span className="field-error">{fieldErrors.anyMedicalCondition}</span>
                )}
              </RegField>
              <div className="form-row">
                <RegField fieldKey="allergies" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "allergies", "Allergies")}</label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="Allergies (if any)"
                    className={fieldErrors.allergies ? "input-error" : ""}
                  />
                  {fieldErrors.allergies && (
                    <span className="field-error">{fieldErrors.allergies}</span>
                  )}
                </RegField>
                <RegField fieldKey="insurance" regConfig={regConfig}>
                  <label>{fieldLabel(regConfig, "insurance", "Insurance")}</label>
                  <input
                    type="text"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleInputChange}
                    placeholder="Insurance details (if any)"
                    className={fieldErrors.insurance ? "input-error" : ""}
                  />
                  {fieldErrors.insurance && (
                    <span className="field-error">{fieldErrors.insurance}</span>
                  )}
                </RegField>
              </div>
            </div>
            )}

            <CustomQuestionsSection
              questions={regConfig.customQuestions}
              answers={customAnswers}
              onChange={setCustomAnswers}
              fieldErrors={fieldErrors}
            />

            {/* 7. Declaration & Legal Agreement */}
            {isDeclarationRequired(regConfig) && (
            <div className="form-section">
              <h3>Declaration & Legal Agreement</h3>
              <div className="reg-terms-check-container">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 mt-1 accent-copper"
                  />
                  <span className="text-gray-300 text-sm leading-relaxed">
                    I confirm that I have read and understood all{" "}
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-copper-accent underline hover:text-white font-semibold"
                    >
                      Terms and Conditions
                    </button>
                    , voluntarily agree to abide by them, and accept full responsibility for my participation. *
                  </span>
                </label>
                {fieldErrors.acceptedTerms && (
                  <p className="field-error mt-2">{fieldErrors.acceptedTerms}</p>
                )}
              </div>
            </div>
            )}

            {/* Form Actions */}
            <div className="form-actions mt-8">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-gray-900 border border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto p-8 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-4">Terms & Conditions</h4>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{declarationText}</p>
            <button
              type="button"
              className="w-full mt-6 py-3 bg-copper text-carbon hover:opacity-90 font-bold rounded-xl transition-colors uppercase tracking-wider"
              onClick={() => setShowTermsModal(false)}
            >
              Close & Agree
            </button>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl p-10 max-w-md w-full text-center shadow-2xl scale-in-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Registration Successful!
            </h3>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              Your registration for{" "}
              <span className="text-copper-accent font-bold">{event?.title}</span>{" "}
              has been confirmed. See you on the road!
            </p>
            <div className="flex flex-col gap-3 mb-6">
              {event && eventId !== "community" && (
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="w-full border border-copper/40 text-copper py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-copper/10 transition-all"
                >
                  Share Event
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setShowSuccessOverlay(false);
                navigate("/events");
              }}
              className="w-full bg-copper text-carbon py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl"
            >
              Return to Events
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showShareModal && event && (
          <EventShareModal event={event} onClose={() => setShowShareModal(false)} compact />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicRegister;
