import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Key,
  Zap
} from "lucide-react";
import { profileService, otpService } from "../services/api";
import BackButton from "./BackButton";

const SignUpForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.error("Please enter your email first");
      return;
    }
    setIsSendingOtp(true);
    try {
      await otpService.send(formData.email, "signup");
      setOtpSent(true);
      setCountdown(60);
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    if (!otpSent) {
      toast.error("Please request and enter the OTP sent to your email");
      return;
    }
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("password", formData.password);
      data.append("otp", formData.otp);

      await profileService.signup(data);

      sessionStorage.setItem("userEmail", formData.email);
      sessionStorage.setItem("userPhone", formData.phone);
      sessionStorage.setItem("userLoggedIn", "true");
      window.dispatchEvent(new Event("user-login-change"));

      toast.success("Account created successfully!");
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/events";
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectUrl);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon text-white flex flex-col">
      
      <main className="flex-grow flex items-center justify-center px-6 py-24 md:py-32">
        <div className="w-full max-w-md">
           {/* Back Button */}
           <BackButton label="Back" className="mb-12" />

           <div className="bg-carbon-light border border-white/5 p-8 md:p-12 relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <UserPlus size={80} />
              </div>
              
              <div className="relative z-10">
                <span className="text-copper font-body text-xs tracking-widest uppercase mb-2 block">Initiation</span>
                <h1 className="font-heading text-4xl uppercase mb-2">Join the Tribe</h1>
                <p className="font-text text-steel-dim mb-10">Enlist in India's largest riding collective.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                        placeholder="RIDERS NAME"
                      />
                    </div>
                  </div>

                  {/* Email & OTP Row */}
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Transmission</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={otpSent && countdown > 0}
                          className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors disabled:opacity-50"
                          placeholder="rider@bucindia.com"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || countdown > 0}
                        className="btn-metallica px-6 disabled:opacity-50 min-w-[100px]"
                      >
                        {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "Get OTP"}
                      </button>
                    </div>
                  </div>

                  {/* OTP Input */}
                  {otpSent && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="font-body text-[10px] uppercase tracking-widest text-copper">Verification Code</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-copper" size={18} />
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-carbon border border-copper/30 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors text-center tracking-[0.5em]"
                          placeholder="••••••"
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Mobile Link</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                        placeholder="10 DIGIT NUMBER"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Secure Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-carbon border border-white/10 pl-12 pr-12 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-dim hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-metallica w-full py-5 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-carbon/30 border-t-carbon rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserPlus size={20} />
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                   <p className="font-text text-steel-dim text-sm">
                     Already registered?{" "}
                     <button
                       onClick={() => navigate("/login")}
                       className="text-copper uppercase font-body text-xs tracking-widest ml-2 hover:text-white transition-colors"
                     >
                       Access Portal
                     </button>
                   </p>
                </div>
              </div>
           </div>
        </div>
      </main>


    </div>
  );
};

export default SignUpForm;
