import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GlareHover from "./animations/GlareHover";

const navigation = [
  { name: "HOME", path: "/", label: "WELCOME" },
  { name: "REGISTER", path: "/register", label: "ENROLL" },
  { name: "EVENTS", path: "/events", label: "EXPERIENCE" },
  { name: "GALLERY", path: "/gallery", label: "VISUALS" },
  { name: "MEMBERS", path: "/members", label: "BROTHERHOOD" },
  { name: "FORUM", path: "/forum", label: "COMMUNITY" },
  { name: "CLUBS", path: "/clubs", label: "NETWORK" },
  { name: "INTERNATIONAL", path: "/international", label: "GLOBAL" },
];

// Animated Menu Bar — a single line of the hamburger
const MenuBar = ({ variants, className = "" }) => (
  <motion.span
    variants={variants}
    className={`block h-[2px] bg-current rounded-full ${className}`}
  />
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const linksRef = useRef([]);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 sm:top-5 sm:left-5 z-[1001] cursor-pointer group interactive-item"
      >
        <img
          src="/bucpng.png"
          alt="BUC India"
          className="h-14 sm:h-20 w-auto brightness-0 invert opacity-100 transition-opacity duration-200"
        />
      </div>

      {/* Premium Menu Trigger Wrapper */}
      <div className="fixed top-5 right-5 sm:top-10 sm:right-10 z-[1001] flex items-center gap-4 sm:gap-6">
        {/* Hover Side Label */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="font-heading text-sm tracking-[0.5em] text-copper uppercase select-none hidden md:block"
            >
              {isOpen ? "CLOSE" : "NAVIGATION"}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Animated Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative flex flex-col items-end justify-center gap-[7px] w-12 h-12 interactive-item group ${
            isOpen ? "text-copper" : "text-white"
          }`}
          aria-label="Toggle Menu"
        >
          {/* L Corners */}
          <div className="absolute -inset-3">
            <span
              className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            ></span>
            <span
              className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            ></span>
            <span
              className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            ></span>
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            ></span>
          </div>

          {/* Top bar */}
          <motion.span
            animate={isOpen
              ? { rotateZ: 45, y: 9, width: "100%", backgroundColor: "#C19A6B" }
              : isHovered
              ? { width: "100%", x: 0 }
              : { width: "100%", x: 0 }
            }
            initial={false}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1] }}
            className="block h-[2px] bg-current rounded-full origin-center"
            style={{ width: "100%" }}
          />

          {/* Middle bar */}
          <motion.span
            animate={isOpen
              ? { opacity: 0, scaleX: 0 }
              : isHovered
              ? { width: "65%", opacity: 1, scaleX: 1 }
              : { width: "75%", opacity: 1, scaleX: 1 }
            }
            initial={false}
            transition={{ duration: 0.35, ease: "easeInOut", delay: isOpen ? 0 : 0.05 }}
            className="block h-[2px] bg-current rounded-full self-end"
            style={{ width: "75%" }}
          />

          {/* Bottom bar */}
          <motion.span
            animate={isOpen
              ? { rotateZ: -45, y: -9, width: "100%", backgroundColor: "#C19A6B" }
              : isHovered
              ? { width: "50%" }
              : { width: "50%" }
            }
            initial={false}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1] }}
            className="block h-[2px] bg-current rounded-full origin-center self-end"
            style={{ width: "50%" }}
          />
        </button>
      </div>

      {/* Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 bg-carbon z-[1000] flex flex-col md:flex-row md:items-center md:justify-center overflow-x-hidden"
          >
            {/* Background Ghost Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
              <span className="font-heading text-[25vw] text-white/[0.02] leading-none whitespace-nowrap">
                BUC INDIA
              </span>
              <div className="absolute bottom-[10%] right-[-2%] font-heading text-[6vw] text-white/[0.1]">
                RIDE
              </div>
            </div>

            {/* Accent Elements */}
            <div className="absolute left-[clamp(40px,6vw,80px)] top-0 bottom-0 w-[1px] bg-copper/10 hidden md:block" />
            <div className="absolute left-[clamp(40px,6vw,80px)] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-copper/40 rotate-45 hidden md:block" />
            <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-copper/20" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-copper/20" />

            {/* Premium Animations Style */}
            <style>{`
              .nav-link-btn {
                position: relative;
                padding: 0.5rem 0;
                transition: color 0.4s ease;
              }
              .nav-link-btn::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0;
                height: 1px;
                background: #C19A6B;
                transition: width 0.6s cubic-bezier(0.7, 0, 0.3, 1);
              }
              .nav-link-btn:hover::before, .nav-link-btn.active::before {
                width: 100%;
              }
              .nav-link-btn.active {
                text-shadow: 0 0 20px rgba(193, 154, 107, 0.3);
              }
            `}</style>

            {/* Scrollable Nav Area (mobile: flex-1 scroll; desktop: centered) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden md:overflow-visible md:flex-none w-full md:flex md:items-center md:justify-center">
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-6 md:pt-0 md:pb-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-12 items-center">
              {/* Navigation Links (Left Pane) */}
              <nav className="md:col-span-7 flex flex-col items-start gap-1 md:gap-4">
                {navigation.map((item, index) => (
                  <div
                    key={item.name}
                    ref={(el) => (linksRef.current[index] = el)}
                    className="overflow-hidden"
                  >
                    <motion.button
                      onClick={() => handleNavigate(item.path)}
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.35, delay: 0.08 + index * 0.05, ease: [0.2, 0, 0, 1] }}
                      className={`nav-link-btn group flex items-center gap-12 interactive-item ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                    >
                      <span
                        className={`font-heading text-[10vw] sm:text-5xl md:text-7xl transition-all duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] ${
                          location.pathname === item.path
                            ? "text-copper tracking-[0.1em] md:tracking-[0.2em]"
                            : "text-white/40 group-hover:text-white group-hover:tracking-[0.1em] md:group-hover:tracking-[0.2em]"
                        }`}
                      >
                        {item.name}
                      </span>
                      {/* Hover reveal sub-text */}
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 font-body text-[10px] tracking-[0.3em] text-copper uppercase">
                        {item.label}
                      </span>
                    </motion.button>
                  </div>
                ))}
              </nav>

              {/* Right Pane: Auth & Social — hidden on mobile */}
              <div className="hidden md:flex md:col-span-5 flex-col items-start md:items-end gap-12">
                {/* Auth Section */}
                <div className="flex flex-col items-start md:items-end gap-10 w-full mb-8">
                  <button
                    onClick={() => handleNavigate("/login")}
                    className="group relative flex items-center gap-4 font-body text-xs tracking-ultra text-white/40 hover:text-white transition-colors py-2"
                  >
                    LOGIN
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-copper group-hover:w-full transition-all duration-500"></span>
                  </button>

                  <div className="relative group">
                    <GlareHover>
                      <button
                        onClick={() => handleNavigate("/register")}
                        className="px-10 py-4 bg-transparent border border-copper/30 text-copper font-heading text-xl tracking-widest relative overflow-hidden group/btn hover:border-copper transition-colors duration-300 interactive-item"
                      >
                        <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-carbon">
                          REGISTER NOW
                        </span>
                        <div className="absolute inset-0 bg-copper translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] -z-0"></div>
                      </button>
                    </GlareHover>
                  </div>
                </div>

                {/* Social Section */}
                <div className="flex flex-col items-start md:items-end gap-6 w-full pt-12 border-t border-white/5">
                  <span className="font-body text-[10px] tracking-[0.5em] text-white/20 uppercase">
                    FOLLOW US
                  </span>
                  <div className="flex flex-col items-start md:items-end gap-3">
                    {[
                      { name: "INSTAGRAM", url: "#" },
                      { name: "FACEBOOK", url: "#" },
                      { name: "TWITTER", url: "#" },
                      { name: "YOUTUBE", url: "#" },
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        className="group relative font-heading text-lg text-white/30 hover:text-copper transition-all hover:tracking-widest py-1"
                      >
                        {social.name}
                        <span className="absolute bottom-0 right-0 w-0 h-[1px] bg-copper/40 group-hover:w-full transition-all duration-500"></span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>{/* end scrollable area */}

            {/* Desktop Bottom Quote */}
            <div className="hidden md:block absolute bottom-10 left-0 w-full text-center px-6">
              <div className="flex flex-col gap-2">
                <div className="text-copper font-body tracking-[0.4em] text-[10px] uppercase opacity-60">
                  Ride Together • Stand Together • BUC India
                </div>
                <div className="text-white/10 font-heading text-xs tracking-widest uppercase">
                  Where Passion Meets the Pavement
                </div>
              </div>
            </div>

            {/* Mobile-only: Pinned bottom auth bar */}
            <div className="md:hidden relative z-20 flex-none w-full">
              {/* Subtle top separator glow */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
              <div className="flex items-stretch bg-carbon/95 backdrop-blur-md">
                <button
                  onClick={() => handleNavigate("/login")}
                  className="flex-1 py-5 flex items-center justify-center gap-2 font-body text-xs tracking-[0.4em] uppercase text-white/50 hover:text-copper border-r border-white/5 transition-colors duration-300"
                >
                  <span className="w-4 h-[1px] bg-current"></span>
                  LOGIN
                  <span className="w-4 h-[1px] bg-current"></span>
                </button>
                <button
                  onClick={() => handleNavigate("/register")}
                  className="flex-1 py-5 flex items-center justify-center font-heading text-sm tracking-widest uppercase bg-copper text-carbon hover:bg-white transition-colors duration-300"
                >
                  REGISTER
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
