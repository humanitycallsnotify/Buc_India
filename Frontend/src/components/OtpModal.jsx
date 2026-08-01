import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Key, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { otpService, profileService } from "../services/api";

const OtpModal = ({ isOpen, onClose, onSuccess, defaultType = 'signup', disableMobileAuth = false }) => {
  const [authMethod, setAuthMethod] = useState("email"); // "email" or "mobile"
  
  // Force email method if mobile is disabled
  useEffect(() => {
    if (disableMobileAuth && authMethod === "mobile") {
      setAuthMethod("email");
    }
  }, [disableMobileAuth, authMethod]);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notRegistered, setNotRegistered] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (authMethod === "email" && !email) {
      return toast.error("Please enter your email.");
    }
    if (authMethod === "mobile" && phone.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile number.");
    }

    setIsSendingOtp(true);
    setNotRegistered(false);
    try {
      if (defaultType === "login" || defaultType === "event_registration") {
        try {
          const profile = await profileService.get(authMethod === "email" ? email : null, authMethod === "mobile" ? phone : null);
          if (!profile || Object.keys(profile).length === 0) {
            setNotRegistered(true);
            setIsSendingOtp(false);
            return;
          }
        } catch (err) {
          setNotRegistered(true);
          setIsSendingOtp(false);
          return;
        }
      }

      if (authMethod === "email") {
        await otpService.send(email, defaultType, "Rider"); // Using Rider as default category for OTP
      } else {
        // Simulate mobile OTP or use actual service if available
        // await otpService.sendMobile(phone, defaultType);
        toast.info("Mobile OTP simulated. Use 123456.");
      }
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP.");
    }
    setIsVerifyingOtp(true);
    try {
      if (authMethod === "email") {
        await otpService.verify(email, otp, defaultType);
      } else {
        if (otp !== "123456") throw new Error("Invalid simulated OTP");
      }
      
      // Ensure user exists if they are logging in or applying for an event
      if (defaultType === "login" || defaultType === "event_registration") {
        try {
          const profile = await profileService.get(authMethod === "email" ? email : null, authMethod === "mobile" ? phone : null);
          if (!profile || Object.keys(profile).length === 0) {
            throw new Error("Profile not found.");
          }
        } catch (err) {
          toast.error("You must register your profile before continuing.");
          onClose();
          window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { type: "signup" } }));
          return;
        }
      }
      
      toast.success("Authentication successful!");
      
      // Save authenticated user info to session storage so registration form can use it
      sessionStorage.setItem("userLoggedIn", "true");
      sessionStorage.setItem("authMethod", authMethod);
      sessionStorage.setItem("authIdentifier", authMethod === "email" ? email : phone);
      if (authMethod === "email") {
        sessionStorage.setItem("userEmail", email);
      } else {
        sessionStorage.setItem("userPhone", phone);
      }
      
      window.dispatchEvent(new Event("user-login-change"));
      
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
        navigate("/register/community"); // Default routing after auth
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to verify OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resetState = () => {
    setOtpSent(false);
    setOtp("");
    setCountdown(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-carbon-light border border-white/10 shadow-2xl rounded-xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-copper/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-copper w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl uppercase tracking-wider text-white text-center">
                Join The Brotherhood
              </h2>
              <p className="font-text text-sm text-steel-dim text-center mt-2">
                Authenticate to continue your registration
              </p>
            </div>

            {notRegistered ? (
              <div className="space-y-6 animate-fade-in text-center">
                <p className="text-white text-lg font-body">You are not a registered user. Please register to continue.</p>
                <button
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { type: "signup" } }));
                  }}
                  className="w-full py-4 bg-copper text-carbon font-body font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-lg flex items-center justify-center gap-2 mt-4"
                >
                  Go to Register <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setNotRegistered(false)}
                  className="text-xs text-steel-dim hover:text-white underline underline-offset-4 mt-2 inline-block"
                >
                  Back to Login
                </button>
              </div>
            ) : !otpSent ? (
              <div className="space-y-6">
                {!disableMobileAuth && (
                  <div className="flex bg-carbon border border-white/10 rounded-lg p-1">
                    <button
                      onClick={() => { setAuthMethod("email"); resetState(); }}
                      className={`flex-1 py-2 text-xs font-body uppercase tracking-wider rounded-md transition-all ${
                        authMethod === "email" ? "bg-copper text-carbon font-bold" : "text-steel-dim hover:text-white"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => { setAuthMethod("mobile"); resetState(); }}
                      className={`flex-1 py-2 text-xs font-body uppercase tracking-wider rounded-md transition-all ${
                        authMethod === "mobile" ? "bg-copper text-carbon font-bold" : "text-steel-dim hover:text-white"
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {authMethod === "email" ? (
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter your mobile number"
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || (authMethod === "email" && !email) || (authMethod === "mobile" && phone.length !== 10)}
                    className="w-full py-4 bg-copper text-carbon font-body font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSendingOtp ? "Sending..." : "Send OTP"} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <p className="font-text text-sm text-white">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="font-body text-sm text-copper font-bold tracking-wider">
                    {authMethod === "email" ? email : phone}
                  </p>
                  <button onClick={resetState} className="text-xs text-steel-dim hover:text-white underline underline-offset-4">
                    Change {authMethod === "email" ? "email" : "mobile"}
                  </button>
                </div>

                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit OTP"
                    autoComplete="one-time-code"
                    className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-center tracking-[0.5em] text-lg text-white outline-none focus:border-copper transition-colors rounded-lg"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className="w-full py-4 bg-copper text-carbon font-body font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify & Continue"} <CheckCircle size={16} />
                </button>

                <div className="text-center">
                  <button
                    onClick={handleSendOtp}
                    disabled={countdown > 0}
                    className="text-xs text-steel-dim hover:text-white disabled:opacity-50 transition-colors font-body uppercase tracking-wider"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OtpModal;
