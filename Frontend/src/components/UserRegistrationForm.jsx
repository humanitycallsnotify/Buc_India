import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Bike,
  Camera,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Zap,
  Key,
  Upload,
  X,
  GraduationCap,
  Users,
  Plus,
  ChevronDown,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { profileService, otpService, clubService } from "../services/api";
import TermsModal from "./TermsModal";
import DobPicker from "./DobPicker";
import { USER_TERMS, USER_TERMS_FINAL_ACCEPTANCE } from "../constants/userRegistrationTerms";
import {
  getDuplicateEmailMessage,
  getDuplicatePhoneMessage,
  OTP_VERIFY_SUCCESS,
  mapOtpVerifyError,
} from "../constants/registrationValidationMessages";

const SOCIAL_PLATFORMS = [
  { value: "facebook", label: "Facebook", placeholder: "e.g. https://facebook.com/yourprofile", field: "facebookUrl" },
  { value: "instagram", label: "Instagram", placeholder: "e.g. https://instagram.com/yourusername", field: "instagramUrl" },
  { value: "twitter", label: "Twitter/X", placeholder: "e.g. https://x.com/yourusername", field: "twitterUrl" },
  { value: "website", label: "Personal Website", placeholder: "e.g. https://yourwebsite.com", field: "websiteUrl" },
];

const getSocialPlaceholder = (platform) => {
  if (!platform) return "Please select your presence";
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.placeholder || "Enter profile link";
};

const mapSocialProfilesToFields = (profiles) => {
  const fields = { facebookUrl: "", instagramUrl: "", twitterUrl: "", websiteUrl: "" };
  profiles.forEach(({ platform, url }) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const config = SOCIAL_PLATFORMS.find((p) => p.value === platform);
    if (config?.field) fields[config.field] = trimmed;
  });
  return fields;
};

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    registrationType: "",
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    dateOfBirth: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bikeModel: "",
    bikeRegistrationNumber: "",
    licenseNumber: "",
    clubId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    collegeName: "",
    collegeIdNo: "",
    riderPhone: "",
    riderRegistrationId: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [licenseImagePreview, setLicenseImagePreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [socialProfiles, setSocialProfiles] = useState([{ platform: "", url: "" }]);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone" || name === "emergencyContactPhone" || name === "riderPhone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      if (name === "phone") setPhoneError("");
    } else if (name === "email") {
      setFormData(prev => ({ ...prev, [name]: value }));
      setEmailError("");
      setEmailVerified(false);
      setOtpSent(false);
    } else if (name === "otp") {
      setFormData(prev => ({ ...prev, [name]: value }));
      setEmailVerified(false);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const checkEmailDuplicate = async (email) => {
    if (!email?.trim() || !email.includes("@")) {
      setEmailError("");
      return false;
    }
    if (!formData.registrationType) {
      return false;
    }
    try {
      const result = await profileService.checkEmailRegistered(
        email.trim(),
        formData.registrationType,
        "User",
      );
      if (result.registered) {
        const msg = result.message || getDuplicateEmailMessage("User", formData.registrationType);
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
    if (!formData.registrationType) {
      return false;
    }
    try {
      const result = await profileService.checkPhoneRegistered(
        phone,
        formData.registrationType,
        "User",
      );
      if (result.registered) {
        const msg = result.message || getDuplicatePhoneMessage("User", formData.registrationType);
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

  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSocialPlatformChange = (index, platform) => {
    setSocialProfiles((prev) =>
      prev.map((profile, i) => (i === index ? { ...profile, platform } : profile))
    );
  };

  const handleSocialUrlChange = (index, url) => {
    setSocialProfiles((prev) =>
      prev.map((profile, i) => (i === index ? { ...profile, url } : profile))
    );
  };

  const handleAddSocialProfile = () => {
    setSocialProfiles((prev) => [...prev, { platform: "", url: "" }]);
  };

  const handleRemoveSocialProfile = (index) => {
    if (index === 0) return;
    setSocialProfiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return toast.error("Please enter your email first");
    if (!formData.registrationType) {
      return toast.error("Please select a registration category first.");
    }
    if (await checkEmailDuplicate(formData.email)) {
      return;
    }
    setEmailVerified(false);
    setIsSendingOtp(true);
    try {
      await otpService.send(formData.email, "signup", formData.registrationType);
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
      await otpService.verify(formData.email, formData.otp, "signup");
      setEmailVerified(true);
      toast.success(OTP_VERIFY_SUCCESS);
    } catch (err) {
      setEmailVerified(false);
      toast.error(mapOtpVerifyError(err.response?.data?.message));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.registrationType) {
      return toast.error("Please select a registration category.");
    }

    const isRider = formData.registrationType === "Rider" || formData.registrationType === "Student Rider";
    const isStudent = formData.registrationType === "Student" || formData.registrationType === "Student Rider";
    const isPS = formData.registrationType === "PS";
    const isPublicUser = formData.registrationType === "Public User";
    const isPillion = formData.registrationType === "Pillion";
    const needsDob =
      isRider ||
      formData.registrationType === "Student" ||
      isPillion ||
      isPublicUser;

    // 1. Core validations common to ALL registration types
    if (
      !formData.fullName || !formData.phone || !formData.gender ||
      !formData.address || !formData.city || !formData.state || !formData.pincode
    ) {
      return toast.error("Please fill all required fields: Name, Phone, Gender, and Address details.");
    }

    if (formData.phone.length !== 10) return toast.error("Phone number must be exactly 10 digits");

    if (await checkPhoneDuplicate(formData.phone)) {
      return;
    }

    if (!isPS && !isPublicUser) {
      if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
        return toast.error("Please fill Emergency Contact details.");
      }
    }

    if (!isPS) {
      if (!formData.email || !formData.password || !formData.otp) {
        return toast.error("Please fill Email, Password, and OTP.");
      }
      if (await checkEmailDuplicate(formData.email)) {
        return;
      }
      if (!emailVerified) {
        return toast.error("Please verify your email with OTP before submitting.");
      }
    }

    if (needsDob && !isPS && !formData.dateOfBirth) {
      return toast.error("Please fill Date of Birth.");
    }

    if (!isPS && !isPublicUser) {
      if (formData.emergencyContactPhone.length !== 10) return toast.error("Emergency contact phone number must be exactly 10 digits");

      if (!profileImage) {
        return toast.error("Please upload your Profile Image.");
      }
    }

    // 2. Rider & PS specific validations
    if (isRider) {
      if (
        !formData.dateOfBirth || !formData.bloodGroup ||
        !formData.bikeModel || !formData.bikeRegistrationNumber || !formData.licenseNumber
      ) {
        return toast.error("Please fill all required Rider fields (Date of birth, Blood group, Bike Details, and DL details).");
      }
      if (!licenseImage) {
        return toast.error("Please upload your License/DL Image.");
      }
    }

    if (isPS) {
      if (!formData.bikeModel || !formData.bikeRegistrationNumber) {
        return toast.error("Please fill Bike Model and Registration Number.");
      }
    }

    // 3. Student specific validations
    if (isStudent) {
      if (!formData.collegeName || !formData.collegeIdNo) {
        return toast.error("Please provide College Name and Student ID number.");
      }
    }

    // 4. Pillion specific validations
    if (isPillion) {
      if (!formData.riderPhone) {
        return toast.error("Please provide Rider Phone number.");
      }
      if (formData.riderPhone.length !== 10) {
        return toast.error("Rider Phone number must be exactly 10 digits");
      }
    }

    if (!isPS && !termsAccepted) {
      return toast.error("Please accept the Declaration & Legal Agreement to proceed.");
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();

      // Append core fields (Common to all)
      data.append("registrationType", formData.registrationType);
      data.append("fullName", formData.fullName);
      data.append("phone", formData.phone);
      data.append("gender", formData.gender);
      if (!isPS) {
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("otp", formData.otp);
      }
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("pincode", formData.pincode);

      if (!isPS && !isPublicUser) {
        data.append("emergencyContactName", formData.emergencyContactName);
        data.append("emergencyContactPhone", formData.emergencyContactPhone);
      }

      // Social details & Profile image (Common to non-PS)
      if (!isPS) {
        const socialFields = mapSocialProfilesToFields(socialProfiles);
        if (socialFields.facebookUrl) data.append("facebookUrl", socialFields.facebookUrl);
        if (socialFields.instagramUrl) data.append("instagramUrl", socialFields.instagramUrl);
        if (socialFields.twitterUrl) data.append("twitterUrl", socialFields.twitterUrl);
        if (socialFields.websiteUrl) data.append("websiteUrl", socialFields.websiteUrl);
        if (!isPublicUser && profileImage) data.append("profileImage", profileImage);
      }

      // Conditionally append Rider details
      if (isRider || isPS) {
        data.append("bikeModel", formData.bikeModel);
        data.append("bikeRegistrationNumber", formData.bikeRegistrationNumber);
      }

      if (isRider) {
        data.append("dateOfBirth", formData.dateOfBirth);
        data.append("bloodGroup", formData.bloodGroup);
        data.append("licenseNumber", formData.licenseNumber);
        if (formData.clubId) data.append("clubId", formData.clubId);

        if (licenseImage) data.append("licenseImage", licenseImage);
      } else if (needsDob && !isPS) {
        data.append("dateOfBirth", formData.dateOfBirth);
      }

      // Conditionally append Student details
      if (isStudent) {
        data.append("collegeName", formData.collegeName);
        data.append("collegeIdNo", formData.collegeIdNo);
      }

      // Conditionally append Pillion details
      if (isPillion) {
        data.append("riderPhone", formData.riderPhone);
        if (formData.riderRegistrationId) {
          data.append("riderRegistrationId", formData.riderRegistrationId);
        }
      }

      await profileService.signup(data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          registrationType: "",
          fullName: "", gender: "", email: "", phone: "", password: "", otp: "",
          dateOfBirth: "", bloodGroup: "", address: "", city: "", state: "", pincode: "",
          bikeModel: "", bikeRegistrationNumber: "", licenseNumber: "", clubId: "",
          emergencyContactName: "", emergencyContactPhone: "",
          collegeName: "", collegeIdNo: "", riderPhone: "", riderRegistrationId: "",
        });
        setProfileImage(null); setProfileImagePreview(null);
        setLicenseImage(null); setLicenseImagePreview(null);
        setSocialProfiles([{ platform: "", url: "" }]);
        setOtpSent(false);
        setEmailVerified(false);
        setTermsAccepted(false);
        setPhoneError("");
        setEmailError("");
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="p-12 md:p-20 text-center animate-fade-in text-white bg-carbon-light border border-white/5 h-full flex flex-col justify-center items-center">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-copper/10 rounded-full flex items-center justify-center">
            <CheckCircle className="text-copper" size={48} />
          </div>
        </div>
        <h2 className="font-heading text-4xl uppercase mb-4">Registration Successful</h2>
        <p className="font-text text-steel-dim mb-8">
          Welcome to the brotherhood. Your profile has been created successfully.
        </p>
      </div>
    );
  }

  const isRider = formData.registrationType === "Rider" || formData.registrationType === "Student Rider";
  const isStudent = formData.registrationType === "Student" || formData.registrationType === "Student Rider";
  const isPS = formData.registrationType === "PS";
  const isPublicUser = formData.registrationType === "Public User";
  const isPillion = formData.registrationType === "Pillion";

  return (
    <div className="bg-carbon-light border border-white/5 text-white max-w-4xl mx-auto p-6 md:p-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-8 mb-12 gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="BUC India Logo" className="w-16 h-16 rounded-full border border-copper/30 object-cover" />
          <div>
            <h1 className="font-heading text-3xl uppercase tracking-wider text-white">BUC India</h1>
            <span className="text-copper font-body text-[10px] tracking-[0.2em] uppercase">Bikers Unity Calls</span>
          </div>
        </div>
        <h2 className="font-heading text-2xl uppercase flex items-center gap-3 text-steel-dim sm:border-l sm:border-white/10 sm:pl-8">
          <User size={24} className="text-copper" /> User Registration
        </h2>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-12">

        {/* Registration Type Selection */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Select Registration Category <span className="text-red-500">*</span></h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            {[
              {
                id: "Rider",
                title: "Rider",
                description: "Full Rider Details",
                icon: Bike,
              },
              {
                id: "Public User",
                title: "Public User",
                description: "",
                icon: Users,
              },
              {
                id: "Student",
                title: "Student",
                description: "College Student (No Ride)",
                icon: GraduationCap,
              },
              {
                id: "Student Rider",
                title: "Student Rider",
                description: "Student with DL & Bike",
                icon: Zap,
              },
              {
                id: "Pillion",
                title: "Pillion",
                description: "Co-Rider / Pillion",
                icon: User,
              },
              {
                id: "PS",
                title: "PS",
                description: "",
                icon: Users,
              },
            ].map((type) => {
              const IconComp = type.icon;
              const isSelected = formData.registrationType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData((prev) => {
                    if (prev.registrationType === type.id) return prev;
                    setEmailVerified(false);
                    setOtpSent(false);
                    setEmailError("");
                    setPhoneError("");
                    return {
                      ...prev,
                      registrationType: type.id,
                    };
                  })}
                  className={`flex flex-col items-center justify-center p-3 sm:p-6 border text-center transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? "bg-copper/10 border-copper text-white shadow-[0_0_15px_rgba(202,138,4,0.15)]"
                      : "bg-carbon border-white/5 text-steel-dim hover:border-white/20 hover:text-white hover:bg-carbon-light"
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-4 transition-all duration-300 ${
                    isSelected ? "bg-copper text-carbon" : "bg-white/5 text-steel-dim group-hover:bg-white/10 group-hover:text-white"
                  }`}>
                    <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="font-heading text-[10px] sm:text-base uppercase tracking-wide mb-1 block">
                    {type.title}
                  </span>
                  {type.description && (
                    <span className="font-text text-[8px] sm:text-[10px] opacity-60 leading-tight">
                      {type.description}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                      <CheckCircle className="text-copper w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {formData.registrationType && (
          <div className="space-y-12 animate-fade-in">
            {/* Uploads */}
            {!isPS && !isPublicUser && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Visual Assets <span className="text-red-500">*</span></h3>
                <div className={`grid grid-cols-1 ${isRider ? 'md:grid-cols-2' : 'max-w-md mx-auto'} gap-8`}>
                  <label className="group cursor-pointer">
                    <div className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group-hover:border-copper/50 transition-all duration-500 bg-carbon/30">
                      <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-4 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                        <Camera size={20} />
                      </div>
                      <span className="font-body text-[10px] uppercase tracking-widest text-white font-semibold mb-1 group-hover:text-copper transition-colors">Profile Image <span className="text-red-500">*</span></span>
                      <span className="font-text text-[9px] text-white/20 truncate max-w-[150px]">
                        {profileImage ? profileImage.name : "Deploy File (IMG)"}
                      </span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setProfileImage, setProfileImagePreview)} />
                  </label>

                  {isRider && (
                    <label className="group cursor-pointer">
                      <div className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group-hover:border-copper/50 transition-all duration-500 bg-carbon/30">
                        <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-4 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                          <FileText size={20} />
                        </div>
                        <span className="font-body text-[10px] uppercase tracking-widest text-white font-semibold mb-1 group-hover:text-copper transition-colors">License Image <span className="text-red-500">*</span></span>
                        <span className="font-text text-[9px] text-white/20 truncate max-w-[150px]">
                          {licenseImage ? licenseImage.name : "Deploy File (IMG)"}
                        </span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setLicenseImage, setLicenseImagePreview)} />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Basic Info <span className="text-red-500">*</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" name="fullName" icon={User} value={formData.fullName} onChange={handleInputChange} required />
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handlePhoneBlur}
                      required
                      className={`w-full bg-carbon border pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors ${phoneError ? "border-red-500" : "border-white/10"}`}
                    />
                  </div>
                  {phoneError && (
                    <p className="font-body text-[10px] text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {phoneError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm text-white outline-none focus:border-copper transition-colors appearance-none">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefernottosay">Prefer not to say</option>
                  </select>
                </div>

                {!isPS && (
                  <>
                    <div className="space-y-1">
                      <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Email Address <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleEmailBlur}
                            required
                            disabled={otpSent && countdown > 0}
                            className={`w-full bg-carbon border pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors disabled:opacity-50 ${emailError ? "border-red-500" : "border-white/10"}`}
                          />
                        </div>
                        <button type="button" onClick={handleSendOtp} disabled={isSendingOtp || countdown > 0} className="px-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 min-w-[90px]">
                          {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "SEND OTP"}
                        </button>
                      </div>
                      {emailError && (
                        <p className="font-body text-[10px] text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle size={12} /> {emailError}
                        </p>
                      )}
                    </div>
                    {emailVerified && (
                      <p className="font-body text-[10px] text-green-400 flex items-center gap-1.5">
                        <CheckCircle size={14} /> Email Verified
                      </p>
                    )}
                    {otpSent && !emailVerified && (
                      <div className="space-y-2">
                        <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">OTP <span className="text-red-500">*</span></label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-grow">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                            <input
                              type="text"
                              name="otp"
                              value={formData.otp}
                              onChange={handleInputChange}
                              required
                              className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors"
                              placeholder="Enter 6-digit OTP"
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
                    <div className="space-y-1">
                      <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 pl-12 pr-12 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-dim hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    {isPublicUser && (
                      <DobPicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Student Details */}
            {isStudent && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Student Information <span className="text-red-500">*</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="College Name" name="collegeName" icon={GraduationCap} value={formData.collegeName} onChange={handleInputChange} required />
                  <InputField label="Student ID Number" name="collegeIdNo" icon={FileText} value={formData.collegeIdNo} onChange={handleInputChange} required />
                  {formData.registrationType === "Student" && (
                    <DobPicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                  )}
                </div>
              </div>
            )}

            {/* Personal Details */}
            {isRider && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DobPicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                  <div className="space-y-1">
                    <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Blood Group <span className="text-red-500">*</span></label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm text-white outline-none focus:border-copper transition-colors appearance-none">
                      <option value="">Select Blood Group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Pillion Specific details */}
            {isPillion && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Pillion Riding Connection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DobPicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                  <InputField label="Associated Rider's Phone Number" name="riderPhone" icon={Phone} type="tel" value={formData.riderPhone} onChange={handleInputChange} required />
                  <InputField label="Associated Rider's BUC ID (Optional)" name="riderRegistrationId" icon={User} value={formData.riderRegistrationId} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-6">
              <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Address Info <span className="text-red-500">*</span></h3>
              <InputField label="Address" name="address" icon={MapPin} value={formData.address} onChange={handleInputChange} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} required />
                <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} required />
                <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
              </div>
            </div>

            {/* Bike Information */}
            {(isRider || isPS) && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Bike & License Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Bike Model" name="bikeModel" icon={Bike} value={formData.bikeModel} onChange={handleInputChange} required />
                  <InputField label="Bike Registration Number" name="bikeRegistrationNumber" icon={FileText} value={formData.bikeRegistrationNumber} onChange={handleInputChange} required />
                  {isRider && <InputField label="License Number" name="licenseNumber" icon={FileText} value={formData.licenseNumber} onChange={handleInputChange} required />}
                </div>
              </div>
            )}

            {/* Club Affiliation (Featured Section) */}
            {isRider && (
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
                      <select name="clubId" value={formData.clubId} onChange={handleInputChange} className="w-full bg-carbon border border-white/20 hover:border-copper/50 pl-12 pr-4 py-4 font-body text-sm text-white outline-none focus:border-copper transition-all appearance-none cursor-pointer shadow-inner">
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

            {/* Emergency Contact */}
            {!isPS && !isPublicUser && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Emergency Contact <span className="text-red-500">*</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Emergency Contact Name" name="emergencyContactName" icon={User} value={formData.emergencyContactName} onChange={handleInputChange} required />
                  <InputField label="Emergency Contact Phone" name="emergencyContactPhone" icon={Phone} type="tel" value={formData.emergencyContactPhone} onChange={handleInputChange} required />
                </div>
              </div>
            )}

            {/* Social Presence */}
            {!isPS && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Social Presence</h3>
                <p className="font-text text-xs text-steel-dim">Select a platform from the dropdown and add your profile link.</p>
                <div className="space-y-4">
                  {socialProfiles.map((profile, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-1 gap-6 items-end ${index > 0 ? "md:grid-cols-[1fr_1fr_auto]" : "md:grid-cols-2"}`}
                    >
                      <div className="space-y-1">
                        <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Platform</label>
                        <div className="relative">
                          <select
                            value={profile.platform}
                            onChange={(e) => handleSocialPlatformChange(index, e.target.value)}
                            className="w-full bg-carbon border border-white/10 px-6 py-4 pr-12 font-body text-sm text-white outline-none focus:border-copper transition-colors appearance-none"
                          >
                            <option value="">Please select your presence</option>
                            {SOCIAL_PLATFORMS.map((platform) => (
                              <option key={platform.value} value={platform.value}>{platform.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-dim pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">Profile Link</label>
                        <input
                          type="url"
                          value={profile.url}
                          onChange={(e) => handleSocialUrlChange(index, e.target.value)}
                          placeholder={profile.platform ? getSocialPlaceholder(profile.platform) : "Please select your presence"}
                          className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors placeholder:text-white/30"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialProfile(index)}
                          aria-label="Remove social presence row"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSocialProfile}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all"
                  >
                    <Plus size={14} /> Add Another
                  </button>
                </div>
              </div>
            )}

            {/* Declaration & Legal Agreement — not shown for PS */}
            {!isPS && (
            <div className="space-y-6 bg-carbon/50 p-6 border border-white/5 rounded-small">
              <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2 flex items-center gap-2">
                <Shield size={14} /> Declaration & Legal Agreement
              </h3>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-copper bg-carbon border border-white/10 rounded cursor-pointer"
                />
                <label htmlFor="acceptTerms" className="font-text text-xs text-steel-dim leading-relaxed cursor-pointer select-none">
                  I confirm that I have read and understood all{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-copper hover:underline hover:text-white transition-all font-semibold"
                  >
                    Terms and Conditions
                  </button>
                  , voluntarily agree to abide by them, and accept full responsibility for my participation. <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-16 py-6 bg-copper text-carbon font-heading text-2xl uppercase hover:bg-white transition-all duration-500 disabled:opacity-50">
              {isSubmitting ? "Processing..." : "Complete Registration"}
            </button>
          </div>
        )}
      </form>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Ride Registration"
        terms={USER_TERMS}
        finalAcceptanceItems={USER_TERMS_FINAL_ACCEPTANCE}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
          toast.success("Declaration accepted!");
        }}
      />

    </div>
  );
};

const InputField = ({ label, icon: Icon, name, value, onChange, type = "text", required = false }) => (
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
        className={`w-full bg-carbon border border-white/10 ${Icon ? 'pl-12' : 'pl-6'} pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors`}
      />
    </div>
  </div>
);

export default UserRegistrationForm;
