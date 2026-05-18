import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Shield, MapPin, 
  Bike, Camera, Calendar, AlertCircle, FileText, Image as ImageIcon, CheckCircle, Zap, Key, Upload, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { profileService, otpService } from "../services/api";
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

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", password: "", otp: "",
    dateOfBirth: "", bloodGroup: "", address: "", city: "", state: "", pincode: "",
    bikeModel: "", bikeRegistrationNumber: "", licenseNumber: "",
    emergencyContactName: "", emergencyContactPhone: "",
    facebookUrl: "", instagramUrl: "", twitterUrl: "", youtubeUrl: "", websiteUrl: "",
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

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "emergencyContactPhone") {
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
    if (
      !formData.email || !formData.phone || !formData.password || !formData.otp ||
      !formData.fullName || !formData.dateOfBirth || !formData.bloodGroup ||
      !formData.address || !formData.city || !formData.state || !formData.pincode ||
      !formData.bikeModel || !formData.bikeRegistrationNumber || !formData.licenseNumber ||
      !formData.emergencyContactName || !formData.emergencyContactPhone
    ) {
      return toast.error("Please fill all required fields and enter OTP.");
    }
    if (!profileImage || !licenseImage) {
      return toast.error("Please upload Profile and License images.");
    }
    if (formData.phone.length !== 10) return toast.error("Phone number must be exactly 10 digits");
    if (!otpSent) return toast.error("Please verify your email with OTP first");
    if (!termsAccepted) {
      return toast.error("Please accept the Declaration & Legal Agreement to proceed.");
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (profileImage) data.append("profileImage", profileImage);
      if (licenseImage) data.append("licenseImage", licenseImage);

      await profileService.signup(data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          fullName: "", email: "", phone: "", password: "", otp: "",
          dateOfBirth: "", bloodGroup: "", address: "", city: "", state: "", pincode: "",
          bikeModel: "", bikeRegistrationNumber: "", licenseNumber: "",
          emergencyContactName: "", emergencyContactPhone: "",
          facebookUrl: "", instagramUrl: "", twitterUrl: "", youtubeUrl: "", websiteUrl: "",
        });
        setProfileImage(null); setProfileImagePreview(null);
        setLicenseImage(null); setLicenseImagePreview(null);
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

  return (
    <div className="bg-carbon-light border border-white/5 text-white max-w-4xl mx-auto p-6 md:p-12">
      <h2 className="font-heading text-4xl uppercase mb-12 flex items-center gap-4">
        <User size={32} className="text-copper" /> User Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Basic Info <span className="text-red-500">*</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="fullName" icon={User} value={formData.fullName} onChange={handleInputChange} required />
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Address <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={otpSent && countdown > 0} className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors disabled:opacity-50" />
                </div>
                <button type="button" onClick={handleSendOtp} disabled={isSendingOtp || countdown > 0} className="px-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 min-w-[90px]">
                  {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "SEND OTP"}
                </button>
              </div>
            </div>
            {otpSent && <InputField label="OTP" name="otp" icon={Key} value={formData.otp} onChange={handleInputChange} required />}
            <InputField label="Phone Number" name="phone" icon={Phone} type="tel" value={formData.phone} onChange={handleInputChange} required />
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 pl-12 pr-12 py-4 font-body text-xs outline-none focus:border-copper transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-dim hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Date of Birth" name="dateOfBirth" icon={Calendar} type="date" value={formData.dateOfBirth} onChange={handleInputChange} required />
            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Blood Group <span className="text-red-500">*</span></label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} required className="w-full bg-carbon border border-white/10 px-6 py-4 font-body text-sm outline-none focus:border-copper transition-colors appearance-none">
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Address Info</h3>
          <InputField label="Address" name="address" icon={MapPin} value={formData.address} onChange={handleInputChange} required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} required />
            <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} required />
            <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
          </div>
        </div>

        {/* Bike Information */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Bike Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Bike Model" name="bikeModel" icon={Bike} value={formData.bikeModel} onChange={handleInputChange} required />
            <InputField label="Bike Registration Number" name="bikeRegistrationNumber" icon={FileText} value={formData.bikeRegistrationNumber} onChange={handleInputChange} required />
            <InputField label="License Number" name="licenseNumber" icon={FileText} value={formData.licenseNumber} onChange={handleInputChange} required />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Emergency Contact Name" name="emergencyContactName" icon={User} value={formData.emergencyContactName} onChange={handleInputChange} required />
            <InputField label="Emergency Contact Phone" name="emergencyContactPhone" icon={Phone} type="tel" value={formData.emergencyContactPhone} onChange={handleInputChange} required />
          </div>
        </div>

        {/* Social Presence */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Social Presence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Facebook" name="facebookUrl" value={formData.facebookUrl} onChange={handleInputChange} />
            <InputField label="Instagram" name="instagramUrl" value={formData.instagramUrl} onChange={handleInputChange} />
            <InputField label="Twitter / X" name="twitterUrl" value={formData.twitterUrl} onChange={handleInputChange} />
            <InputField label="YouTube" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleInputChange} />
            <InputField label="Personal Website" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} />
          </div>
        </div>

        {/* Uploads */}
        <div className="space-y-6">
          <h3 className="font-body text-xs uppercase tracking-[0.2em] text-copper border-b border-white/10 pb-2">Uploads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label className="group cursor-pointer">
              <div className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group-hover:border-copper/50 transition-all duration-500 bg-carbon/30">
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-4 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                  <Camera size={20} />
                </div>
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-1 group-hover:text-white">Profile Image <span className="text-red-500">*</span></span>
                <span className="font-text text-[9px] text-white/20 truncate max-w-[150px]">
                  {profileImage ? profileImage.name : "Deploy File (IMG)"}
                </span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setProfileImage, setProfileImagePreview)} />
            </label>
            <label className="group cursor-pointer">
              <div className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group-hover:border-copper/50 transition-all duration-500 bg-carbon/30">
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full mb-4 text-steel-dim group-hover:text-copper group-hover:bg-copper/10 transition-all">
                  <FileText size={20} />
                </div>
                <span className="font-body text-[10px] uppercase tracking-widest text-steel-dim mb-1 group-hover:text-white">License Image <span className="text-red-500">*</span></span>
                <span className="font-text text-[9px] text-white/20 truncate max-w-[150px]">
                  {licenseImage ? licenseImage.name : "Deploy File (IMG)"}
                </span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setLicenseImage, setLicenseImagePreview)} />
            </label>
          </div>
        </div>

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
    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">
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
        className={`w-full bg-carbon border border-white/10 ${Icon ? 'pl-12' : 'pl-6'} pr-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors`}
      />
    </div>
  </div>
);

export default UserRegistrationForm;
