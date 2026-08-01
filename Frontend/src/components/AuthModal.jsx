import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Lock, Eye, EyeOff, UserPlus, LogIn, Key, ShieldCheck, User } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { profileService, otpService, userAuthService, clubService } from "../services/api";

const AuthModal = ({ isOpen, onClose, defaultType = "login" }) => {
  const [activeTab, setActiveTab] = useState(defaultType);
  
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultType === "signup" ? "signup" : "login");
    }
  }, [isOpen, defaultType]);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    ridingClub: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [clubs, setClubs] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "signup" && clubs.length === 0) {
      const fetchClubs = async () => {
        try {
          const data = await clubService.getPublic();
          setClubs(data);
        } catch (err) {
          console.error("Failed to fetch clubs", err);
        }
      };
      fetchClubs();
    }
  }, [activeTab, clubs.length]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const user = await profileService.login(loginForm.email, loginForm.password);
      sessionStorage.setItem("userEmail", user.email);
      sessionStorage.setItem("userPhone", user.phone || "");
      sessionStorage.setItem("userLoggedIn", "true");
      window.dispatchEvent(new Event("user-login-change"));
      
      toast.success("Logged in successfully!");
      onClose();
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setRegisterForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setRegisterForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSendOtp = async () => {
    if (!registerForm.email) {
      toast.error("Please enter your email first");
      return;
    }
    setIsSendingOtp(true);
    try {
      await otpService.send(registerForm.email, "signup");
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerForm.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    if (!registerForm.ridingClub) {
      toast.error("Please select a Riding Club");
      return;
    }
    if (!otpSent) {
      toast.error("Please request and enter the OTP sent to your email");
      return;
    }
    setIsRegistering(true);
    try {
      const data = new FormData();
      data.append("fullName", registerForm.fullName);
      data.append("email", registerForm.email);
      data.append("phone", registerForm.phone);
      data.append("password", registerForm.password);
      data.append("otp", registerForm.otp);
      
      // If independent rider is selected, don't send a clubId
      if (registerForm.ridingClub !== "none") {
        data.append("clubId", registerForm.ridingClub);
      }

      await profileService.signup(data);

      sessionStorage.setItem("userEmail", registerForm.email);
      sessionStorage.setItem("userPhone", registerForm.phone);
      sessionStorage.setItem("userLoggedIn", "true");
      window.dispatchEvent(new Event("user-login-change"));

      toast.success("Account created successfully!");
      onClose();
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md my-auto bg-carbon-light border border-white/10 shadow-2xl rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex bg-carbon border border-white/10 rounded-lg p-1 mb-6 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2 text-xs font-body uppercase tracking-wider rounded-md transition-all ${
                  activeTab === "login" ? "bg-copper text-carbon font-bold" : "text-steel-dim hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2 text-xs font-body uppercase tracking-wider rounded-md transition-all ${
                  activeTab === "signup" ? "bg-copper text-carbon font-bold" : "text-steel-dim hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-carbon border border-white/10 pl-10 pr-4 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg"
                      placeholder="rider@bucindia.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-carbon border border-white/10 pl-10 pr-10 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-dim hover:text-white transition-colors"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 mt-6 bg-copper text-carbon font-body font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? "Logging in..." : "Access Portal"} <LogIn size={16} />
                </button>
              </form>
            )}

            {/* Registration Form */}
            {activeTab === "signup" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={registerForm.fullName}
                      onChange={handleRegisterInputChange}
                      className="w-full bg-carbon border border-white/10 pl-10 pr-4 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg"
                      placeholder="Rider's Name"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Transmission</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                      <input
                        type="email"
                        name="email"
                        required
                        disabled={otpSent && countdown > 0}
                        value={registerForm.email}
                        onChange={handleRegisterInputChange}
                        className="w-full bg-carbon border border-white/10 pl-10 pr-4 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg disabled:opacity-50"
                        placeholder="rider@bucindia.com"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || countdown > 0}
                      className="bg-carbon border border-white/10 text-white font-body text-[10px] uppercase tracking-wider px-4 rounded-lg hover:border-copper transition-colors disabled:opacity-50 shrink-0 whitespace-nowrap"
                    >
                      {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "Get OTP"}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-body text-[10px] uppercase tracking-widest text-copper">Verification Code</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-copper" size={16} />
                      <input
                        type="text"
                        name="otp"
                        required
                        value={registerForm.otp}
                        onChange={handleRegisterInputChange}
                        className="w-full bg-carbon border border-copper/30 pl-10 pr-4 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg text-center tracking-[0.5em]"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Mobile Link</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={registerForm.phone}
                      onChange={handleRegisterInputChange}
                      className="w-full bg-carbon border border-white/10 pl-10 pr-4 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg"
                      placeholder="10 Digit Number"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Riding Club <span className="text-copper">*</span></label>
                  <select
                    name="ridingClub"
                    required
                    value={registerForm.ridingClub}
                    onChange={handleRegisterInputChange}
                    className="w-full bg-carbon border border-white/10 px-4 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select your Riding Club</option>
                    <option value="none">Independent Rider (No Club)</option>
                    {clubs.map(club => (
                      <option key={club._id} value={club._id}>{club.clubName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Secure Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      required
                      value={registerForm.password}
                      onChange={handleRegisterInputChange}
                      className="w-full bg-carbon border border-white/10 pl-10 pr-10 py-3 font-body text-sm text-white outline-none focus:border-copper transition-colors rounded-lg"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-dim hover:text-white transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-4 mt-6 bg-copper text-carbon font-body font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRegistering ? "Creating Account..." : "Create Account"} <UserPlus size={16} />
                </button>
              </form>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
