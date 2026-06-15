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
  Calendar,
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
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { profileService, otpService, clubService } from "../services/api";
import TermsModal from "./TermsModal";

const USER_TERMS = [
  {
    title: "1. Compliance with Law",
    content: "I agree to strictly comply with all applicable laws, including Motor Vehicle Act, Traffic Rules, and directions issued by Police and Government Authorities.\nThis ride operates under lawful permissions and regulations."
  },
  {
    title: "2. Voluntary Participation & Assumption of Risk",
    content: "I understand that riding involves inherent risks including accidents, injury, disability, or death.\n\nI voluntarily participate at my own risk and:\n• Accept full responsibility for my safety\n• Assume all risks associated with riding and event participation\n• Waive any right to hold organizers liable except in proven gross negligence"
  },
  {
    title: "3. Health & Fitness Declaration",
    content: "I confirm that:\n• I am physically and mentally fit to participate\n• I do not have any condition that may endanger myself or others\n• I will bear all medical expenses arising from any injury/incident"
  },
  {
    title: "4. Riding Gear & Safety Compliance",
    content: "I agree that:\n• Helmet and riding gear are mandatory\n• I will follow ride discipline, convoy rules, and marshal instructions\n• Any violation may result in removal from the ride"
  },
  {
    title: "5. Code of Conduct",
    content: "I agree to:\n• Maintain respectful and responsible behavior\n• Not engage in rash riding, stunts, or dangerous acts\n• Not consume alcohol, drugs, or intoxicants before or during the ride\n• Follow all instructions from organizers and volunteers\n\nFailure to comply will result in immediate termination without refund or liability."
  },
  {
    title: "6. Prohibited Activities",
    content: "Strictly prohibited:\n• Stunts or racing\n• Drinking and driving\n• Reckless or negligent riding\n• Any unlawful or disruptive behavior"
  },
  {
    title: "7. Injury & Medical Responsibility",
    content: "In case of any injury, accident, illness, or death:\n• I (or my family) shall not hold Humanity Calls Trust, BUC_India, UFH Riders, organizers, volunteers, or partners responsible\n• I agree to bear all costs including hospitalization, treatment, and recovery"
  },
  {
    title: "8. Behavior-Based Termination Clause",
    content: "Organizers reserve the absolute right to:\n• Remove any participant whose behavior is unsafe, harmful, or inappropriate\n\nSuch removal will be at participant’s own cost and risk. No claims, refunds, or compensations will be entertained."
  },
  {
    title: "9. Media Consent",
    content: "I grant permission to:\n• Capture photos/videos of me during the event\n• Use them for promotional, social media, or awareness purposes\n\nI waive any rights to compensation or ownership of such media."
  },
  {
    title: "10. COVID & Public Health Compliance",
    content: "I agree to follow:\n• All Government health advisories\n• COVID-19 or other public safety protocols (if applicable)"
  },
  {
    title: "11. Confidentiality (For Volunteers)",
    content: "I agree not to disclose:\n• Internal information\n• Operational or organizational details\n\nUnauthorized sharing may lead to legal action."
  },
  {
    title: "12. Volunteer Terms (If Applicable)",
    content: "• Participation is voluntary, not employment\n• Assigned roles must be followed responsibly\n• Registration fee (if applicable) is Non-refundable"
  },
  {
    title: "⚠️ 13. Conflict of Interest Clause",
    content: "I declare that:\n• I have no personal, financial, or professional conflict that interferes with my participation\n• I will not misuse the platform for personal gain, promotions, or competing interests\n• I will disclose any potential conflict to organizers immediately\n\nFailure to disclose may result in termination and legal action."
  },
  {
    title: "🚫 14. Waiver of Claims & Legal Protection",
    content: "I expressly agree that:\n• I shall not raise any claim, lawsuit, or legal action against:\n  - Humanity Calls Trust\n  - Bikers Unity Calls (BUC_India)\n  - Unity For Humanity Riders (UFH Riders)\n  - Organizers, volunteers, sponsors, or partners\n• This includes claims related to:\n  - Injury, accident, death\n  - Property damage or loss\n  - Emotional distress or inconvenience\n\nThis waiver applies even in unforeseen circumstances, except in cases of proven intentional misconduct."
  },
  {
    title: "15. Limitation of Liability",
    content: "Under no circumstances shall the organizers be liable for:\n• Indirect or consequential damages\n• Financial losses or missed opportunities\n• Third-party actions or incidents"
  },
  {
    title: "16. Indemnity Clause",
    content: "I agree to indemnify and hold harmless the organizers and associated entities from:\n• Any claims arising due to my actions, negligence, or misconduct\n• Any legal consequences caused by violation of rules or laws"
  },
  {
    title: "17. Termination Rights",
    content: "Organizers reserve the right to:\n• Cancel or modify the event\n• Deny participation without explanation\n• Take action against misconduct"
  },
  {
    title: "18. Collaboration Clause",
    content: "This ride is conducted under:\n• Humanity Calls Trust\n• Bikers Unity Calls (BUC_India)\n• Unity For Humanity Riders (UFH Riders)\n• Supporting NGOs and partners\n\nAll activities align with Government rules and lawful operations."
  }
];

const SOCIAL_PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp", placeholder: "e.g. https://wa.me/91XXXXXXXXXX" },
  { value: "instagram", label: "Instagram", placeholder: "e.g. https://instagram.com/yourusername", field: "instagramUrl" },
  { value: "twitter", label: "Twitter/X", placeholder: "e.g. https://x.com/yourusername", field: "twitterUrl" },
  { value: "website", label: "Personal Website", placeholder: "e.g. https://yourwebsite.com", field: "websiteUrl" },
];

const getSocialPlaceholder = (platform) =>
  SOCIAL_PLATFORMS.find((p) => p.value === platform)?.placeholder || "Enter profile link";

const mapSocialProfilesToFields = (profiles) => {
  const fields = { instagramUrl: "", twitterUrl: "", websiteUrl: "" };
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
    tshirtSize: "",
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
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    websiteUrl: "",
    socialLinks: [],
    collegeName: "",
    collegeIdNo: "",
    riderPhone: "",
    riderRegistrationId: ""
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [licenseImagePreview, setLicenseImagePreview] = useState(null);

  const [socialPlatform, setSocialPlatform] = useState("");
  const [socialUrl, setSocialUrl] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [socialProfiles, setSocialProfiles] = useState([{ platform: "whatsapp", url: "" }]);

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
    const { name, value } = e.target;
    if (name === "phone" || name === "emergencyContactPhone" || name === "riderPhone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleAddSocialLink = () => {
    if (!socialPlatform || !socialUrl) {
      toast.error("Please select a platform and enter a URL");
      return;
    }
    if (!socialUrl.startsWith("http://") && !socialUrl.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    if (formData.socialLinks.some(link => link.platform.toLowerCase() === socialPlatform.toLowerCase())) {
      toast.error(`You have already added a link for ${socialPlatform}`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: socialPlatform, url: socialUrl }]
    }));
    setSocialPlatform("");
    setSocialUrl("");
  };

  const handleRemoveSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, idx) => idx !== index)
    }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return toast.error("Please enter your email first");
    setIsSendingOtp(true);
    try {
      await otpService.send(formData.email, "signup");
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
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

    // 1. Core validations common to ALL registration types
    if (
      !formData.fullName || !formData.phone || !formData.gender || !formData.tshirtSize ||
      !formData.address || !formData.city || !formData.state || !formData.pincode
    ) {
      return toast.error("Please fill all required fields: Name, Phone, Gender, T-Shirt Size, and Address details.");
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
      if (!otpSent) return toast.error("Please verify your email with OTP first");
    }

    if (formData.phone.length !== 10) return toast.error("Phone number must be exactly 10 digits");
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

    if (!termsAccepted) {
      return toast.error("Please accept the Declaration & Legal Agreement to proceed.");
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();

      // Append core fields (Common to all)
      data.append("registrationType", formData.registrationType);
      data.append("fullName", formData.fullName);
      data.append("phone", formData.phone);
      data.append("tshirtSize", formData.tshirtSize);
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
      if (!isPS && !isPublicUser) {
        let fbVal = formData.facebookUrl || "";
        let instaVal = formData.instagramUrl || "";
        let twVal = formData.twitterUrl || "";
        let ytVal = formData.youtubeUrl || "";
        let webVal = formData.websiteUrl || "";

        if (formData.socialLinks) {
          formData.socialLinks.forEach(link => {
            if (link.platform && link.url) {
              const p = link.platform.toLowerCase();
              if (p === "facebook") fbVal = link.url;
              else if (p === "instagram") instaVal = link.url;
              else if (p === "twitter" || p === "x") twVal = link.url;
              else if (p === "youtube") ytVal = link.url;
              else if (p === "website") webVal = link.url;
            }
          });
        }

        if (fbVal) data.append("facebookUrl", fbVal);
        if (instaVal) data.append("instagramUrl", instaVal);
        if (twVal) data.append("twitterUrl", twVal);
        if (ytVal) data.append("youtubeUrl", ytVal);
        if (webVal) data.append("websiteUrl", webVal);
        data.append("socialLinks", JSON.stringify(formData.socialLinks || []));
        if (profileImage) data.append("profileImage", profileImage);
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
          fullName: "", gender: "", email: "", phone: "", password: "", otp: "", tshirtSize: "",
          dateOfBirth: "", bloodGroup: "", address: "", city: "", state: "", pincode: "",
          bikeModel: "", bikeRegistrationNumber: "", licenseNumber: "", clubId: "",
          emergencyContactName: "", emergencyContactPhone: "",
          collegeName: "", collegeIdNo: "", riderPhone: "", riderRegistrationId: ""
        });
        setProfileImage(null); setProfileImagePreview(null);
        setLicenseImage(null); setLicenseImagePreview(null);
        setSocialProfiles([{ platform: "whatsapp", url: "" }]);
        setOtpSent(false);
        setTermsAccepted(false);
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
          <img src="/bucpng.png" alt="BUC India Logo" className="w-16 h-16 rounded-full border border-copper/30 object-contain p-1 bg-white" />
          <div>
            <h1 className="font-heading text-3xl uppercase tracking-wider text-white">BUC India</h1>
            <span className="text-copper font-body text-[10px] tracking-[0.2em] uppercase">Bikers Unity Calls</span>
          </div>
        </div>
        <h2 className="font-heading text-2xl uppercase flex items-center gap-3 text-steel-dim sm:border-l sm:border-white/10 sm:pl-8">
          <User size={24} className="text-copper" /> User Registration
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-12">

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
                  onClick={() => setFormData((prev) => ({ ...prev, registrationType: type.id }))}
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
                <InputField label="Phone Number" name="phone" icon={Phone} type="tel" value={formData.phone} onChange={handleInputChange} required />

                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-white font-semibold">T-Shirt Size <span className="text-red-500">*</span></label>
                  <select name="tshirtSize" value={formData.tshirtSize} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm text-white outline-none focus:border-copper transition-colors appearance-none">
                    <option value="">Select Size</option>
                    {["S", "M", "L", "XL", "XXL", "XXXL"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
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
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={otpSent && countdown > 0} className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors disabled:opacity-50" />
                        </div>
                        <button type="button" onClick={handleSendOtp} disabled={isSendingOtp || countdown > 0} className="px-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 min-w-[90px]">
                          {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "SEND OTP"}
                        </button>
                      </div>
                    </div>
                    {otpSent && <InputField label="OTP" name="otp" icon={Key} value={formData.otp} onChange={handleInputChange} required />}
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
                </div>
              </div>
            )}

            {/* Personal Details */}
            {isRider && (
              <div className="space-y-6">
                <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Date of Birth" name="dateOfBirth" icon={Calendar} type="date" value={formData.dateOfBirth} onChange={handleInputChange} required />
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
                <div className="flex flex-col gap-1 border-b border-white/10 pb-2">
                  <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper">Social Presence <span className="text-white/40 ml-1 text-[10px] normal-case tracking-normal">(Optional)</span></h3>
                  <p className="text-[10px] text-white/50 font-body">Add your social media profiles to help the community connect with you.</p>
                </div>

                {formData.socialLinks && formData.socialLinks.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 px-4 py-3 border border-white/10 shadow-inner group transition-colors hover:border-copper/30">
                        <div className="flex items-center gap-3">
                          <span className="uppercase text-[10px] font-bold px-2 py-1 bg-copper/20 text-copper font-body tracking-wider">
                            {link.platform}
                          </span>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/70 truncate hover:text-white transition-colors max-w-[150px] sm:max-w-[250px] font-body">
                            {link.url}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="text-white/40 hover:text-red-400 p-1 transition-colors"
                          title="Remove link"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 md:max-w-[200px]">
                    <div className="relative group">
                      <select
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value)}
                        className="w-full bg-carbon border border-white/20 hover:border-copper/50 px-4 py-4 font-body text-sm text-white outline-none focus:border-copper transition-all appearance-none cursor-pointer shadow-inner"
                      >
                        <option value="">Select Platform</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Twitter">Twitter/X</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Website">Website</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-steel-dim">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="flex-[2]">
                    <div className="relative group">
                      <input
                        type="url"
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="https://instagram.com/yourprofile"
                        className="w-full bg-carbon border border-white/20 hover:border-copper/50 px-4 py-4 font-body text-sm text-white outline-none focus:border-copper transition-all placeholder:text-white/20 shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="md:self-end">
                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      className="bg-white/10 hover:bg-copper hover:text-black text-white font-body text-xs uppercase tracking-widest font-semibold py-4 px-6 transition-all w-full md:w-auto shadow-inner border border-white/20 hover:border-copper"
                    >
                      Add Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Declaration & Legal Agreement */}
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
        finalAcceptanceItems={[
          "I have read and understood all terms and conditions",
          "I voluntarily agree to abide by them",
          "I accept full responsibility for my participation"
        ]}
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
