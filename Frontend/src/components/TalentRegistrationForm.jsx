import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, MapPin, Music, Star, Clock, Link, Bike,
  FileText, Calendar, Trophy, CheckCircle, Shield, ChevronDown, Key,
  Upload, Image as ImageIcon, Video as VideoIcon
} from "lucide-react";
import { talentService, clubService, otpService, profileService } from "../services/api";
import DobPicker from "./DobPicker";
import {
  getDuplicateEmailMessage,
  getDuplicatePhoneMessage,
  OTP_VERIFY_SUCCESS,
  mapOtpVerifyError,
} from "../constants/registrationValidationMessages";

const TALENT_CATEGORIES = {
  "🎤 Performing Arts": [
    "Singing (Solo)", "Singing (Group/Band)", "Rap / Beatboxing",
    "Dancing (Solo)", "Dancing (Group)", "Choreography",
    "Instrument Playing (Guitar, Drums, Violin, etc.)",
    "DJ / Music Mixing", "Acting / Drama", "Stand-up Comedy", "Mimicry",
  ],
  "🎨 Creative Arts": [
    "Drawing / Sketching", "Painting", "Digital Art / Graphic Design",
    "Photography", "Videography", "Short Film Making",
    "Content Creation (YouTube / Reels)",
  ],
  "🏍️ Biker & Event-Specific Talents": [
    "Riding Skills (Slow Race, Balance, Control)", "Motorcycle Vlogging",
    "Travel Storytelling", "Bike Maintenance Skills Demo",
  ],
  "🧠 Skills & Knowledge": [
    "Public Speaking", "Anchoring / Hosting", "Motivational Speaking",
    "Storytelling", "Debate",
  ],
  "💪 Fitness & Performance": [
    "Fitness / Bodybuilding", "Yoga / Flexibility", "Martial Arts",
    "Parkour / Freestyle Movement",
  ],
  "🎭 Others": [
    "Magic Show", "Fashion Walk / Modeling",
    "Unique Talent (Specify)", "Other (Please Specify)",
  ],
};

const ALL_SUBCATEGORIES = Object.entries(TALENT_CATEGORIES).flatMap(([group, items]) =>
  items.map(item => ({ group, item }))
);

const initialFormData = {
  fullName: "", age: "", dateOfBirth: "", gender: "", phone: "", email: "", city: "", tshirtSize: "",
  talentCategory: "", subTalentDescription: "",
  experienceLevel: "", yearsOfExperience: "",
  portfolioLink: "",
  isRider: "", bikeModel: "", ridingExperience: "", clubId: "",
  shortDescription: "", whyParticipate: "",
  availableDates: "",
  openToPerformLive: "", openToCompetition: "",
  pastAchievements: "", socialMediaLinks: "",
  consentInfoTrue: false, consentRules: false, consentMedia: false,
  otp: "",
};

const TalentRegistrationForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [clubs, setClubs] = useState([]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [talentImage, setTalentImage] = useState(null);
  const [talentVideo, setTalentVideo] = useState(null);
  const [talentImagePreview, setTalentImagePreview] = useState("");
  const [talentVideoPreview, setTalentVideoPreview] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file size should not exceed 10MB");
        return;
      }
      setTalentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setTalentImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file size should not exceed 100MB");
        return;
      }
      setTalentVideo(file);
      setTalentVideoPreview(URL.createObjectURL(file));
    }
  };

  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address first");
      return;
    }
    if (await checkEmailDuplicate(formData.email)) {
      return;
    }
    setEmailVerified(false);
    setIsSendingOtp(true);
    try {
      await otpService.send(formData.email, "talent_signup");
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error("Unable to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.email || !formData.otp || formData.otp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }
    setIsVerifyingOtp(true);
    try {
      await otpService.verify(formData.email, formData.otp, "talent_signup");
      setEmailVerified(true);
      toast.success(OTP_VERIFY_SUCCESS);
    } catch (err) {
      setEmailVerified(false);
      toast.error(mapOtpVerifyError(err.response?.data?.message));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  React.useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await clubService.getPublic();
        setClubs(data || []);
      } catch (err) {
        console.error("Failed to fetch clubs:", err);
      }
    };
    fetchClubs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 10) }));
      setPhoneError("");
    } else if (name === "email") {
      setFormData(prev => ({ ...prev, [name]: value }));
      setEmailError("");
      setEmailVerified(false);
      setOtpSent(false);
    } else if (name === "otp") {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 6) }));
      setEmailVerified(false);
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const checkEmailDuplicate = async (email) => {
    if (!email?.trim() || !email.includes("@")) {
      setEmailError("");
      return false;
    }
    try {
      const result = await profileService.checkEmailRegistered(email.trim(), null, "Talent");
      if (result.registered) {
        const msg = result.message || getDuplicateEmailMessage("Talent");
        setEmailError(msg);
        toast.error(msg);
        return true;
      }
      setEmailError("");
      return false;
    } catch {
      return false;
    }
  };

  const handleEmailBlur = async () => {
    await checkEmailDuplicate(formData.email);
  };

  const checkPhoneDuplicate = async (phone) => {
    if (phone.length !== 10) {
      setPhoneError("");
      return false;
    }
    try {
      const result = await profileService.checkPhoneRegistered(phone, null, "Talent");
      if (result.registered) {
        const msg = result.message || getDuplicatePhoneMessage("Talent");
        setPhoneError(msg);
        toast.error(msg);
        return true;
      }
      setPhoneError("");
      return false;
    } catch {
      return false;
    }
  };

  const handlePhoneBlur = async () => {
    await checkPhoneDuplicate(formData.phone);
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setFormData(prev => ({ ...prev, talentCategory: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "fullName", "age", "dateOfBirth", "gender", "phone", "email", "city", "tshirtSize",
      "talentCategory", "subTalentDescription", "experienceLevel", "yearsOfExperience",
      "shortDescription", "whyParticipate", "availableDates", "otp",
    ];
    for (const field of required) {
      if (!formData[field]) {
        return toast.error(`Please fill in: ${field.replace(/([A-Z])/g, " $1")}`);
      }
    }
    if (!emailVerified) {
      return toast.error("Please verify your email with OTP before submitting.");
    }
    if (await checkEmailDuplicate(formData.email)) {
      return;
    }
    if (await checkPhoneDuplicate(formData.phone)) {
      return;
    }
    if (!formData.consentInfoTrue || !formData.consentRules || !formData.consentMedia) {
      return toast.error("Please check all three consent checkboxes before submitting.");
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      if (talentImage) {
        payload.append("talentImage", talentImage);
      }
      if (talentVideo) {
        payload.append("talentVideo", talentVideo);
      }

      await talentService.submit(payload);
      setShowSuccess(true);
      setFormData(initialFormData);
      setOtpSent(false);
      setEmailVerified(false);
      setSelectedGroup("");
      setTalentImage(null);
      setTalentVideo(null);
      setTalentImagePreview("");
      setTalentVideoPreview("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="p-12 md:p-20 text-center animate-fade-in text-white bg-carbon-light border border-white/5 flex flex-col justify-center items-center">
        <div className="w-24 h-24 bg-copper/10 rounded-full flex items-center justify-center mb-8">
          <CheckCircle className="text-copper" size={48} />
        </div>
        <h2 className="font-heading text-4xl uppercase mb-4">Registration Successful!</h2>
        <p className="font-text text-steel-dim mb-8 max-w-lg">
          Your talent registration has been submitted successfully. Our team will review your profile and get in touch!
        </p>
        <button
          onClick={() => setShowSuccess(false)}
          className="px-10 py-4 bg-copper text-carbon font-heading text-lg uppercase hover:bg-white transition-all duration-300"
        >
          Submit Another
        </button>
      </div>
    );
  }

  const subcatsForGroup = selectedGroup
    ? (TALENT_CATEGORIES[selectedGroup] || [])
    : [];

  return (
    <div className="bg-carbon-light border border-white/5 text-white max-w-4xl mx-auto p-6 md:p-12 relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-carbon/90 z-50 flex flex-col items-center justify-center text-center p-6 animate-fade-in backdrop-blur-sm">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-2 border-copper/20 rounded-full animate-ping absolute inset-0" />
            <div className="w-20 h-20 border-t-2 border-r-2 border-copper rounded-full animate-spin flex items-center justify-center">
              <Upload size={32} className="text-copper animate-bounce" />
            </div>
          </div>
          <h3 className="font-heading text-2xl uppercase tracking-wider text-white mb-2">
            Uploading Visual Assets...
          </h3>
          <p className="font-text text-steel-dim text-sm max-w-sm leading-relaxed">
            Please wait while we process and upload your showcase image and video to Cloudinary.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-8 mb-12 gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="BUC India Logo" className="w-16 h-16 rounded-full border border-copper/30 object-cover" />
          <div>
            <h1 className="font-heading text-3xl uppercase tracking-wider text-white">BUC India</h1>
            <span className="text-copper font-body text-[10px] tracking-[0.2em] uppercase">Bikers Unity Calls</span>
          </div>
        </div>
        <h2 className="font-heading text-2xl uppercase flex items-center gap-3 text-steel-dim sm:border-l sm:border-white/10 sm:pl-8">
          <Star size={24} className="text-copper" /> Talent Registration
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* Visual Showcase Assets */}
        <div className="space-y-6 bg-carbon/20 p-6 md:p-8 border border-white/5 shadow-inner">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-3 flex items-center gap-3">
            <Upload size={14} className="text-copper" /> Visual Showcase Assets
          </h3>
          <p className="font-text text-xs text-steel-dim leading-relaxed mb-4">
            Upload a stunning image and an interactive video displaying your unique talents. Supported image formats: JPG, PNG, WEBP. Supported video formats: MP4, MOV, WEBM.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Upload Box */}
            <div className="flex flex-col space-y-4">
              <span className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
                Talent Image Showcase
              </span>
              <label className="relative group border border-dashed border-white/10 hover:border-copper/50 transition-all duration-300 bg-carbon/40 flex flex-col items-center justify-center p-6 h-60 text-center cursor-pointer overflow-hidden w-full block">
                {talentImagePreview ? (
                  <div className="absolute inset-0 w-full h-full group">
                    <img src={talentImagePreview} alt="Showcase Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-carbon/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                      <ImageIcon size={28} className="text-copper mb-2" />
                      <span className="font-heading text-xs uppercase tracking-widest text-white">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-3 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                      <ImageIcon size={20} />
                    </div>
                    <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-1 group-hover:text-white">Choose Image</span>
                    <span className="font-text text-[9px] text-white/20">Max Size: 10MB</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            {/* Video Upload Box */}
            <div className="flex flex-col space-y-4">
              <span className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
                Talent Video Showcase
              </span>
              <label className="relative group border border-dashed border-white/10 hover:border-copper/50 transition-all duration-300 bg-carbon/40 flex flex-col items-center justify-center p-6 h-60 text-center cursor-pointer overflow-hidden w-full block">
                {talentVideoPreview ? (
                  <div className="absolute inset-0 w-full h-full group">
                    <video src={talentVideoPreview} controls className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-carbon/80 px-3 py-1 rounded text-[9px] font-heading uppercase text-copper border border-copper/20 hover:bg-copper hover:text-carbon transition-colors cursor-pointer z-10" onClick={(e) => {
                      e.preventDefault();
                      setTalentVideo(null);
                      setTalentVideoPreview("");
                    }}>
                      Remove
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-3 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                      <VideoIcon size={20} />
                    </div>
                    <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-1 group-hover:text-white">Choose Video</span>
                    <span className="font-text text-[9px] text-white/20">Max Size: 100MB</span>
                  </div>
                )}
                {!talentVideoPreview && <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />}
              </label>
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <Section title="👤 Basic Details" required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="fullName" icon={User} value={formData.fullName} onChange={handleChange} required />
            <InputField label="Age" name="age" type="number" icon={Clock} value={formData.age} onChange={handleChange} required />
            <DobPicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Gender <span className="text-red-500">*</span></label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors appearance-none">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefernottosay">Prefer not to say</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  required
                  className={`w-full bg-carbon border pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors ${phoneError ? "border-red-500" : "border-white/10"}`}
                />
              </div>
              {phoneError && <p className="font-body text-[10px] text-red-400 mt-1">{phoneError}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end md:col-span-2">
              <div className="md:col-span-2 space-y-1">
                <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Email ID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    required
                    className={`w-full bg-carbon border pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors ${emailError ? "border-red-500" : "border-white/10"}`}
                  />
                </div>
                {emailError && <p className="font-body text-[10px] text-red-400 mt-1">{emailError}</p>}
              </div>
              <div className="pb-0.5">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || countdown > 0}
                  className="w-full h-[52px] bg-white/5 border border-white/10 hover:bg-copper hover:text-carbon text-white font-heading text-[10px] uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white font-bold"
                >
                  {isSendingOtp ? "Transmitting..." : countdown > 0 ? `Resend in ${countdown}s` : otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              </div>
            </div>
            {emailVerified && (
              <p className="md:col-span-2 font-body text-[10px] text-green-400 flex items-center gap-1.5">
                <CheckCircle size={14} /> Email Verified
              </p>
            )}
            {otpSent && !emailVerified && (
              <div className="md:col-span-2 space-y-2">
                <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">OTP <span className="text-red-500">*</span></label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                      placeholder="Enter 6-digit OTP"
                      className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || formData.otp?.length !== 6}
                    className="px-4 py-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {isVerifyingOtp ? "..." : "Verify OTP"}
                  </button>
                </div>
              </div>
            )}
            <InputField label="City / Location" name="city" icon={MapPin} value={formData.city} onChange={handleChange} required />
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">T-Shirt Size <span className="text-red-500">*</span></label>
              <select name="tshirtSize" value={formData.tshirtSize} onChange={handleChange} required className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors appearance-none">
                <option value="">Select Size</option>
                {["S", "M", "L", "XL", "XXL", "XXXL"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Talent Details */}
        <Section title="🎯 Talent Details" required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Talent Category Group Dropdown */}
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Talent Group <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors appearance-none"
                >
                  <option value="">Select Talent Group</option>
                  {Object.keys(TALENT_CATEGORIES).map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none" size={14} />
              </div>
            </div>

            {/* Talent Sub-category Dropdown */}
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Talent Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="talentCategory"
                  value={formData.talentCategory}
                  onChange={handleChange}
                  required
                  disabled={!selectedGroup}
                  className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors appearance-none disabled:opacity-40"
                >
                  <option value="">Select Specific Talent</option>
                  {subcatsForGroup.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none" size={14} />
              </div>
            </div>

            <div className="md:col-span-2">
              <TextAreaField label="Sub-Talent / Description" name="subTalentDescription" value={formData.subTalentDescription} onChange={handleChange} required placeholder="Describe your specific talent in detail..." />
            </div>

            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Experience Level <span className="text-red-500">*</span></label>
              <div className="flex gap-4 mt-2 flex-wrap">
                {["Beginner", "Intermediate", "Professional"].map(level => (
                  <label key={level} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${formData.experienceLevel === level ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="experienceLevel" value={level} checked={formData.experienceLevel === level} onChange={handleChange} className="hidden" />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <InputField label="Years of Experience" name="yearsOfExperience" type="number" icon={Clock} value={formData.yearsOfExperience} onChange={handleChange} required />
          </div>
        </Section>

        {/* Proof of Talent */}
        <Section title="🎥 Proof of Talent">
          <InputField label="Portfolio Link (Google Drive / YouTube / Instagram)" name="portfolioLink" icon={Link} value={formData.portfolioLink} onChange={handleChange} placeholder="https://..." />
        </Section>

        {/* Biker Info */}
        <Section title="🏍️ Biker Info (Optional)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Are you a Rider?</label>
              <div className="flex gap-4 mt-2">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${(formData.isRider === "true" && opt === "Yes") || (formData.isRider === "false" && opt === "No") ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="isRider" value={opt === "Yes" ? "true" : "false"} checked={formData.isRider === (opt === "Yes" ? "true" : "false")} onChange={handleChange} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <InputField label="Bike Model" name="bikeModel" icon={Bike} value={formData.bikeModel} onChange={handleChange} />
            <div className="md:col-span-2">
              <InputField label="Riding Experience" name="ridingExperience" icon={Bike} value={formData.ridingExperience} onChange={handleChange} placeholder="e.g. 5 years touring rider..." />
            </div>
          </div>
        </Section>

        {/* Club Affiliation (Featured Section) */}
        {formData.isRider === "true" && (
          <div className="space-y-6 bg-copper/5 p-6 md:p-8 border border-copper/20 shadow-[0_0_15px_rgba(202,138,4,0.1)] relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -right-10 -top-10 text-copper/5 pointer-events-none">
              <Shield size={150} />
            </div>
            
            <h3 className="font-body text-sm uppercase tracking-[0.2em] text-copper border-b border-copper/20 pb-3 flex items-center gap-3">
              <Shield size={18} /> Club Affiliation <span className="text-steel-dim text-[10px] ml-auto">(Optional)</span>
            </h3>
            
            <div className="space-y-4 max-w-xl relative z-10">
              <p className="font-text text-sm text-steel-dim leading-relaxed">
                If you are a member of an officially registered and approved BUC club, select it below to link your profile with your club.
              </p>
              
              <div className="space-y-1">
                <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Select Your Associated Club</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-copper/70 group-hover:text-copper transition-colors" size={18} />
                  <select name="clubId" value={formData.clubId} onChange={handleChange} className="w-full bg-carbon border border-white/20 hover:border-copper/50 pl-12 pr-4 py-4 font-body text-sm text-white outline-none focus:border-copper transition-all appearance-none cursor-pointer shadow-inner">
                    <option value="">None / Not Applicable</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-steel-dim">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <Section title="📝 Additional Info" required>
          <div className="space-y-6">
            <TextAreaField label="Short Description About Yourself" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required placeholder="Tell us about yourself in 2-3 sentences..." />
            <TextAreaField label="Why Do You Want to Participate?" name="whyParticipate" value={formData.whyParticipate} onChange={handleChange} required placeholder="Share your motivation..." />
          </div>
        </Section>

        {/* Availability */}
        <Section title="📅 Availability" required>
          <InputField label="Available Dates" name="availableDates" icon={Calendar} value={formData.availableDates} onChange={handleChange} required placeholder="e.g. June 15-20, July weekends..." />
        </Section>

        {/* Pro Filter */}
        <Section title="💡 Participation Preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Open to Perform Live on Stage?</label>
              <div className="flex gap-4 mt-2">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${(formData.openToPerformLive === "true" && opt === "Yes") || (formData.openToPerformLive === "false" && opt === "No") ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="openToPerformLive" value={opt === "Yes" ? "true" : "false"} checked={formData.openToPerformLive === (opt === "Yes" ? "true" : "false")} onChange={handleChange} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Open for Competition?</label>
              <div className="flex gap-4 mt-2">
                {["Yes", "No"].map(opt => (
                  <label key={opt} className={`flex items-center gap-2 px-5 py-3 border cursor-pointer transition-all duration-200 font-body text-xs uppercase tracking-widest ${(formData.openToCompetition === "true" && opt === "Yes") || (formData.openToCompetition === "false" && opt === "No") ? "border-copper bg-copper/10 text-white" : "border-white/10 text-steel-dim hover:border-white/30"}`}>
                    <input type="radio" name="openToCompetition" value={opt === "Yes" ? "true" : "false"} checked={formData.openToCompetition === (opt === "Yes" ? "true" : "false")} onChange={handleChange} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Optional */}
        <Section title="🏆 Optional Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField label="Past Achievements / Awards" name="pastAchievements" value={formData.pastAchievements} onChange={handleChange} placeholder="List any awards, achievements, or recognitions..." />
            <TextAreaField label="Social Media Links" name="socialMediaLinks" value={formData.socialMediaLinks} onChange={handleChange} placeholder="Instagram, YouTube, Facebook links..." />
          </div>
        </Section>

        {/* Legal Consent */}
        <Section title="⚠️ Legal & Consent">
          <div className="space-y-4">
            {[
              { name: "consentInfoTrue", label: "I confirm all information provided is true and accurate." },
              { name: "consentRules", label: "I agree to the event rules & safety guidelines." },
              { name: "consentMedia", label: "I give permission to use my photos/videos for promotion." },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name={name}
                  checked={formData[name]}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 accent-copper bg-carbon border border-white/10 cursor-pointer"
                />
                <span className="font-text text-xs text-steel-dim group-hover:text-white transition-colors leading-relaxed">
                  {label} <span className="text-red-500">*</span>
                </span>
              </label>
            ))}
          </div>
        </Section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-16 py-6 bg-copper text-carbon font-heading text-2xl uppercase hover:bg-white transition-all duration-500 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Talent Registration"}
        </button>
      </form>
    </div>
  );
};

const Section = ({ title, required, children }) => (
  <div className="space-y-6">
    <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
      {title} {required && <span className="text-red-500">*</span>}
    </h3>
    {children}
  </div>
);

const InputField = ({ label, icon: Icon, name, value, onChange, type = "text", required = false, placeholder = "" }) => (
  <div className="space-y-1">
    <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-carbon border border-white/10 ${Icon ? "pl-12" : "pl-4"} pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors placeholder:text-white/20`}
      />
    </div>
  </div>
);

const TextAreaField = ({ label, name, value, onChange, required = false, placeholder = "" }) => (
  <div className="space-y-1">
    <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={3}
      placeholder={placeholder}
      className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors resize-none placeholder:text-white/20"
    />
  </div>
);

export default TalentRegistrationForm;
