import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Bike, 
  LogOut, 
  ExternalLink, 
  Menu, 
  ChevronLeft,
  User,
  Bell,
  Star
} from "lucide-react";
import DashboardHome from "../DashboardHome/DashboardHome";
import EventManagement from "../EventManagement/EventManagement";
import ViewRegistrations from "../ViewRegistrations/ViewRegistrations";
import ViewUsers from "../ViewUsers/ViewUsers.jsx";
import GalleryManagement from "../GalleryManagement.jsx";
import ClubManagement from "../ClubManagement/ClubManagement.jsx";
import ViewTalents from "../ViewTalents/ViewTalents.jsx";
import { authService, profileService } from "../../services/api";

const logo = "/logo copy copy.jpg";
const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 80;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const email = sessionStorage.getItem("adminEmail") || "admin@bucindia.com";
      const profile = await profileService.get(email);
      setAdminProfile(profile);
    } catch (error) {
      console.error("Failed to fetch admin profile", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      sessionStorage.removeItem("buc_admin_authenticated");
      sessionStorage.removeItem("adminEmail");
      navigate("/admin/login");
    } catch (error) {
      sessionStorage.removeItem("buc_admin_authenticated");
      navigate("/admin/login");
    }
  };

  const navItems = [
    { path: "/admin/dashboard", name: "Overview", icon: <LayoutDashboard size={20} />, end: true },
    { path: "/admin/events", name: "Events", icon: <Calendar size={20} /> },
    { path: "/admin/registrations", name: "Event Registrations", icon: <FileText size={20} /> },
    { path: "/admin/users", name: "Users", icon: <User size={20} /> },
    { path: "/admin/talents", name: "Talents", icon: <Star size={20} /> },
    { path: "/admin/gallery", name: "Gallery", icon: <ImageIcon size={20} /> },
    { path: "/admin/gallery", name: "Cover Photo", icon: <ImageIcon size={20} /> },
    { path: "/admin/clubs", name: "Clubs", icon: <Bike size={20} /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-carbon-light border-r border-white/5">
      {/* Header/Logo */}
      <div className="p-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full border border-copper/30 overflow-hidden flex-shrink-0">
            <img src={logo} alt="BUC" className="w-full h-full object-cover grayscale" />
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
              <h2 className="font-heading text-lg uppercase leading-none text-white">BUC_India</h2>
              <span className="text-copper font-body text-[8px] tracking-widest uppercase font-bold">Command Center</span>
            </motion.div>
          )}
        </div>
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="text-steel-dim hover:text-white hidden md:block">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <div className="px-4 mb-8">
        {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} className="w-full py-3 flex justify-center text-copper hover:bg-white/5 transition-colors rounded-lg">
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-grow px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all group
                ${isActive 
                  ? "bg-copper text-carbon shadow-lg shadow-copper/10" 
                  : "text-steel-dim hover:bg-white/5 hover:text-white"}
                ${isCollapsed ? "justify-center" : ""}
              `}
              title={isCollapsed ? item.name : ""}
            >
              <span className={`${isActive ? "text-carbon" : "text-steel-dim group-hover:text-copper"} transition-colors`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-body text-xs uppercase tracking-widest font-bold">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-white/5 space-y-2">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-4 py-3 text-steel-dim hover:text-white transition-colors group"
        >
          <ExternalLink size={18} className="group-hover:text-copper" />
          {!isCollapsed && <span className="font-body text-[10px] uppercase tracking-widest font-bold">Public Site</span>}
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors rounded-lg group"
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="font-body text-[10px] uppercase tracking-widest font-bold">Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-carbon text-white">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-carbon/80 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:block sticky top-0 h-screen transition-all duration-300 ease-in-out`}
        style={{ width: isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH }}
      >
        <SidebarContent />
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-carbon/50 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-steel-dim hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-heading text-xl uppercase tracking-widest text-white truncate">
              {navItems.find(item => item.end ? location.pathname === item.path : location.pathname.startsWith(item.path))?.name || "System"}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-body text-xs font-bold uppercase tracking-widest text-white">
                {adminProfile?.fullName || "ADMINISTRATOR"}
              </span>
              <span className="text-copper font-body text-[8px] uppercase tracking-[0.2em]">Active Session</span>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group">
              {adminProfile?.profileImage ? (
                <img src={adminProfile.profileImage} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-steel-dim" />
              )}
              <div className="absolute inset-0 bg-copper/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="p-6 md:p-10 flex-grow">
          <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="registrations" element={<ViewRegistrations />} />
            <Route path="users" element={<ViewUsers />} />
            <Route path="talents" element={<ViewTalents />} />
            <Route path="gallery" element={<GalleryManagement />} />
            <Route path="clubs" element={<ClubManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
