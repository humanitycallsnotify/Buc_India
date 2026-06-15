import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/api";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ChevronRight,
  Loader2
} from "lucide-react";

const logo = "/logo.jpg";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        await authService.checkAuth();
        navigate("/admin/dashboard");
      } catch (err) {
        // Not authenticated, stay on login page
      }
    };
    checkExistingAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(username, password);
      sessionStorage.setItem("buc_admin_authenticated", "true");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-copper/50 to-transparent"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-copper/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-copper/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block p-1 border border-copper/30 rounded-full mb-6">
             <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10">
                <img src={logo} alt="BUC India" className="w-full h-full object-cover grayscale brightness-125" />
             </div>
          </div>
          <span className="text-copper font-body text-[10px] tracking-[0.4em] uppercase mb-2 block font-bold">Secure Access</span>
          <h1 className="font-heading text-4xl uppercase text-white leading-none">Command <span className="text-transparent outline-title">Center</span></h1>
        </div>

        <div className="bg-carbon-light border border-white/5 p-8 md:p-12 shadow-2xl relative group">
          {/* Accent Corner */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-copper opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 text-red-500 font-body text-[10px] uppercase tracking-widest animate-shake">
                <ShieldAlert size={16} />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Operator Identity</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-carbon border border-white/10 pl-12 pr-4 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors"
                  placeholder="USERNAME"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-body text-[10px] uppercase tracking-widest text-steel-dim">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-dim" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-carbon border border-white/10 pl-12 pr-12 py-4 font-body text-xs text-white outline-none focus:border-copper transition-colors"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper text-carbon font-heading text-xl uppercase py-5 flex items-center justify-center gap-3 hover:bg-white transition-all duration-500 disabled:opacity-50 group/btn"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Engage
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center font-text text-[10px] text-steel-dim uppercase tracking-widest opacity-50">
            System restricted to authorized administrators only. Unauthorized access is monitored.
          </p>
        </div>

        <div className="mt-12 text-center">
           <button 
             onClick={() => navigate("/")}
             className="font-body text-[10px] uppercase tracking-ultra text-steel-dim hover:text-copper transition-colors"
           >
             ← Return to Base
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
