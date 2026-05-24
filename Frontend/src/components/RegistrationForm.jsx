import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  CheckCircle,
  Key,
  ShieldCheck,
  Zap
} from "lucide-react";
import { profileService, otpService } from "../services/api";

const RegistrationForm = ({
  isOpen,
  onClose,
  type = "community",
  eventTitle,
  eventId,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email first");
      return;
    }
    setError("");
    setIsSendingOtp(true);
    try {
      await otpService.send(formData.email, "signup");
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send OTP.";
      setError(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.fullName ||
      !formData.gender ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.otp
    ) {
      setError("Please fill all fields, select gender, and enter OTP.");
      return;
    }

    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (!otpSent) {
      setError("Please verify your email with OTP first");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("eventId", type === "community" ? "community" : eventId);
      data.append("fullName", formData.fullName);
      data.append("gender", formData.gender);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("password", formData.password);
      data.append("otp", formData.otp);

      await profileService.signup(data);

      if (formData.email) sessionStorage.setItem("userEmail", formData.email);
      if (formData.phone) sessionStorage.setItem("userPhone", formData.phone);
      sessionStorage.setItem("userLoggedIn", "true");

      window.dispatchEvent(new Event("user-login-change"));

      setShowSuccess(true);
      toast.success(
        type === "community"
          ? "Registration successful!"
          : "Event Registration Complete!",
      );

      setTimeout(() => {
        setFormData({
          fullName: "",
          gender: "",
          email: "",
          phone: "",
          password: "",
          otp: "",
        });
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
        if (type === "community") {
          navigate("/profile");
        }
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting && !showSuccess ? onClose : undefined}
            className="absolute inset-0 bg-carbon/95 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-carbon-light border border-white/5 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-6 right-6 text-steel-dim hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            {showSuccess ? (
              <div className="p-12 md:p-20 text-center animate-fade-in">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-copper/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-copper" size={48} />
                  </div>
                </div>
                <h2 className="font-heading text-4xl uppercase mb-4">Success</h2>
                <p className="font-text text-steel-dim mb-8">
                  {type === "community"
                    ? "Welcome to the circle. Your profile is ready."
                    : `You are enlisted for ${eventTitle}.`}
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-copper/30 border-t-copper rounded-full animate-spin"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row">
                {/* Left Side Info (Optional) */}
                <div className="md:w-1/3 bg-copper/5 p-12 flex-col justify-between border-r border-white/5 hidden md:flex">
                   <div>
                     <Zap className="text-copper mb-8" size={32} />
                     <h2 className="font-heading text-4xl uppercase leading-none mb-4">Join The Pack</h2>
                     <p className="font-text text-xs text-steel-dim leading-relaxed">
                        Become part of the most elite motorcycle brotherhood in the country.
                     </p>
                   </div>
                   <div className="text-[10px] font-body tracking-ultra uppercase opacity-30">
                      BUC INDIA • RIDE TOGETHER
                   </div>
                </div>

                {/* Main Form */}
                <div className="flex-1 p-8 md:p-12 max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <span className="text-copper font-body text-[10px] tracking-widest uppercase mb-2 block">Registration Portal</span>
                  <h3 className="font-heading text-3xl uppercase mb-8">
                    {type === "community" ? "Member Admission" : `Enlist: ${eventTitle}`}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 p-4 font-body text-[10px] uppercase tracking-widest text-red-500 text-center animate-shake">
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors"
                            placeholder="YOUR NAME"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-1">
                        <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-carbon border border-white/10 px-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors appearance-none"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="prefernottosay">Prefer not to say</option>
                        </select>
                      </div>

                      {/* Email Row */}
                      <div className="space-y-1">
                        <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Transmission</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              disabled={otpSent && countdown > 0}
                              className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors disabled:opacity-50"
                              placeholder="EMAIL@DOMAIN.COM"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || countdown > 0}
                            className="px-4 bg-white/5 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-copper hover:text-carbon transition-all disabled:opacity-50 min-w-[90px]"
                          >
                            {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "SEND"}
                          </button>
                        </div>
                      </div>

                      {/* OTP Input */}
                      {otpSent && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="font-body text-[10px] uppercase tracking-widest text-copper">Verification Code</label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-copper" size={16} />
                            <input
                              type="text"
                              name="otp"
                              value={formData.otp}
                              onChange={handleInputChange}
                              required
                              className="w-full bg-carbon border border-copper/30 pl-12 pr-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors text-center tracking-[0.5em]"
                              placeholder="••••••"
                            />
                          </div>
                        </div>
                      )}

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Phone Link</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs outline-none focus:border-copper transition-colors"
                            placeholder="PHONE NUMBER"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Secret Key</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-carbon border border-white/10 pl-12 pr-12 py-4 font-body text-xs outline-none focus:border-copper transition-colors"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-dim hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-metallica w-full py-5 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-carbon/30 border-t-carbon rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <UserPlus size={20} />
                          Finalize Admission
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                     <p className="font-text text-steel-dim text-[10px] uppercase tracking-widest">
                       Already a brother?{" "}
                       <button
                         onClick={() => { onClose(); navigate("/login"); }}
                         className="text-copper hover:text-white transition-colors ml-2"
                       >
                         Access Portal
                       </button>
                     </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationForm;
