import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Key,
  ShieldCheck,
  Zap
} from "lucide-react";
import { profileService, otpService, userAuthService } from "../services/api";
import BackButton from "./BackButton";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await profileService.login(
        formData.email,
        formData.password,
      );

      sessionStorage.setItem("userEmail", user.email);
      sessionStorage.setItem("userPhone", user.phone || "");
      sessionStorage.setItem("userLoggedIn", "true");
      window.dispatchEvent(new Event("user-login-change"));

      toast.success("Logged in successfully!");
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/events";
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectUrl);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetOtp = async () => {
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email");
      return;
    }
    setIsSendingOtp(true);
    try {
      await otpService.send(forgotPasswordEmail, "forgot_password");
      setForgotPasswordStep(2);
      setCountdown(60);
      toast.success("Reset OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotPasswordOtp || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }
    setIsResetting(true);
    try {
      await userAuthService.resetPassword(
        forgotPasswordEmail,
        forgotPasswordOtp,
        newPassword,
      );
      toast.success(
        "Password reset successfully! Please login with your new password.",
      );
      setForgotPasswordOpen(false);
      setForgotPasswordStep(1);
      setForgotPasswordEmail("");
      setForgotPasswordOtp("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsResetting(false);
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
                <LogIn size={80} />
              </div>
              
              <div className="relative z-10">
                <span className="text-copper font-body text-xs tracking-widest uppercase mb-2 block">Secure Portal</span>
                <h1 className="font-heading text-4xl uppercase mb-2">Welcome Back</h1>
                <p className="font-text text-steel-dim mb-10">Identify yourself to access the brotherhood network.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                        placeholder="rider@bucindia.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Password</label>
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="font-body text-[10px] uppercase tracking-widest text-copper hover:text-white transition-colors"
                    >
                      Forgot Password?
                    </button>
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
                        <LogIn size={20} />
                        Login
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                   <p className="font-text text-steel-dim text-sm">
                     Not part of the tribe yet?{" "}
                     <button
                       onClick={() => navigate("/register/signup")}
                       className="text-copper uppercase font-body text-xs tracking-widest ml-2 hover:text-white transition-colors"
                     >
                       Join the Circle
                     </button>
                   </p>
                </div>
              </div>
           </div>
        </div>
      </main>



      {/* Forgot Password Modal Overlay */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-carbon/90 backdrop-blur-sm">
          <div className="bg-carbon-light border border-white/10 p-8 md:p-12 w-full max-w-md relative">
            <button 
              onClick={() => !isResetting && !isSendingOtp && setForgotPasswordOpen(false)}
              className="absolute top-6 right-6 text-steel-dim hover:text-white"
            >
              ✕
            </button>
            
            <span className="text-copper font-body text-[10px] tracking-widest uppercase mb-2 block">Identity Recovery</span>
            <h2 className="font-heading text-3xl uppercase mb-4">Reset Password</h2>
            <p className="font-text text-steel-dim mb-8 text-sm">
              {forgotPasswordStep === 1
                ? "Provide your registered email. We will transmit a temporary verification code."
                : `Input the transmission code sent to ${forgotPasswordEmail}.`}
            </p>

            <div className="space-y-6">
              {forgotPasswordStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                        placeholder="rider@bucindia.com"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendResetOtp}
                    disabled={isSendingOtp}
                    className="btn-metallica w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSendingOtp ? "Transmitting..." : "Send Code"}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Verification Code</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="text"
                        value={forgotPasswordOtp}
                        onChange={(e) => setForgotPasswordOtp(e.target.value)}
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors text-center tracking-[0.5em]"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">New Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-sm outline-none focus:border-copper transition-colors"
                        placeholder="New Password"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setForgotPasswordStep(1)}
                      disabled={isResetting}
                      className="flex-1 border border-white/10 font-body text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className="btn-metallica flex-[2] py-4 disabled:opacity-50"
                    >
                      {isResetting ? "Resetting..." : "Set New Password"}
                    </button>
                  </div>
                  
                  {countdown > 0 ? (
                    <p className="text-center font-body text-[10px] uppercase tracking-widest text-steel-dim">
                      New code available in {countdown}s
                    </p>
                  ) : (
                    <button
                      onClick={handleSendResetOtp}
                      className="w-full text-center font-body text-[10px] uppercase tracking-widest text-copper hover:text-white transition-colors pt-2"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
