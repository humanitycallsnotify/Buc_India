import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "HOME", path: "/", label: "WELCOME" },
  { name: "EVENTS", path: "/events", label: "EXPERIENCE" },
  { name: "GALLERY", path: "/gallery", label: "VISUALS" },
  { name: "MEMBERS", path: "/members", label: "BROTHERHOOD" },
  { name: "FORUM", path: "/forum", label: "DISCUSSIONS" },
  { name: "CLUBS", path: "/clubs", label: "NETWORK" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(sessionStorage.getItem("userLoggedIn") === "true");
    };
    checkAuth();
    window.addEventListener("user-login-change", checkAuth);
    return () => window.removeEventListener("user-login-change", checkAuth);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("lenis-stopped");
    } else {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
    };
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

      {/* Desktop Navigation */}
      <header className="hidden lg:flex fixed top-0 left-0 w-full z-[1000] items-center justify-between px-10 py-8 bg-gradient-to-b from-carbon/95 via-carbon/80 to-transparent">
        <div className="w-[160px]" /> {/* Spacer for absolute logo */}
        
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className={`relative font-heading text-xl tracking-widest uppercase transition-colors hover:text-copper ${
                location.pathname === item.path ? "text-copper" : "text-white"
              }`}
            >
              {item.name}
              {location.pathname === item.path && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-copper" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-8">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { type: "login" } }))}
                className="group relative font-body text-xs tracking-[0.3em] uppercase text-white/70 hover:text-white transition-colors"
              >
                LOGIN
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-copper group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { type: "signup" } }))}
                className="px-6 py-2.5 border border-copper/40 text-copper font-heading text-sm tracking-widest uppercase hover:bg-copper hover:text-carbon transition-all duration-300"
              >
                REGISTER
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavigate("/profile")}
              className="px-6 py-2.5 border border-copper/40 text-copper font-heading text-sm tracking-widest uppercase hover:bg-copper hover:text-carbon transition-all duration-300"
            >
              PROFILE
            </button>
          )}
        </div>
      </header>

      {/* CLOSE / menu trigger — fixed top-right only, hidden on large screens */}
      <div className="fixed top-5 right-5 sm:top-10 sm:right-10 z-[1001] flex items-center gap-3 sm:gap-4 lg:hidden">
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="font-heading text-xs sm:text-sm tracking-[0.4em] text-copper uppercase select-none hidden sm:block"
            >
              {isOpen ? "CLOSE" : "MENU"}
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={toggleMenu}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative flex flex-col items-end justify-center gap-[7px] w-12 h-12 interactive-item group shrink-0 ${
            isOpen ? "text-copper" : "text-white"
          }`}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <div className="absolute -inset-3 pointer-events-none">
            <span
              className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            />
            <span
              className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            />
            <span
              className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 transition-colors duration-500 ${isOpen ? "border-copper" : "border-copper/40 group-hover:border-copper"}`}
            />
          </div>

          <motion.span
            animate={
              isOpen
                ? { rotateZ: 45, y: 9, backgroundColor: "#C19A6B" }
                : { rotateZ: 0, y: 0, backgroundColor: "currentColor" }
            }
            initial={false}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1] }}
            className="block h-[2px] w-full bg-current rounded-full origin-center"
          />
          <motion.span
            animate={
              isOpen
                ? { opacity: 0, scaleX: 0 }
                : { opacity: 1, scaleX: 1, width: "75%" }
            }
            initial={false}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="block h-[2px] bg-current rounded-full self-end"
            style={{ width: "75%" }}
          />
          <motion.span
            animate={
              isOpen
                ? { rotateZ: -45, y: -9, width: "100%", backgroundColor: "#C19A6B" }
                : { rotateZ: 0, y: 0, width: "50%", backgroundColor: "currentColor" }
            }
            initial={false}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.3, 1] }}
            className="block h-[2px] bg-current rounded-full origin-center self-end"
            style={{ width: "50%" }}
          />
        </button>
      </div>

      {/* Fullscreen menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 z-[1000] flex flex-col min-h-0 max-w-[100vw] overflow-hidden bg-carbon lg:hidden"
          >
            {/* Background — clipped, no horizontal bleed */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[22vw] text-white/[0.02] leading-none text-center max-w-full">
                BUC
              </span>
              <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 border-t border-l border-copper/20" />
              <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 border-b border-r border-copper/20" />
              <div className="absolute left-[clamp(24px,5vw,80px)] top-0 bottom-0 w-px bg-copper/10 hidden md:block" />
            </div>

            <style>{`
              .nav-menu-scroll {
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
                overscroll-behavior: contain;
              }
              .nav-link-btn {
                position: relative;
                padding: 0.625rem 0;
                max-width: 100%;
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
              .nav-link-btn:hover::before,
              .nav-link-btn.active::before {
                width: min(100%, 280px);
              }
              .nav-link-btn.active {
                text-shadow: 0 0 20px rgba(193, 154, 107, 0.3);
              }
            `}</style>

            {/* Vertically scrollable navigation */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="nav-menu-scroll flex-1 min-h-0 w-full max-w-full overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              <div className="min-h-full flex flex-col items-start justify-center w-full max-w-3xl mx-auto px-6 sm:px-10 pt-28 pb-8 md:pt-32 md:pb-12">
                <nav className="w-full max-w-full flex flex-col gap-2 sm:gap-3 md:gap-4">
                  {navigation.map((item, index) => (
                    <div
                      key={item.name}
                      ref={(el) => {
                        linksRef.current[index] = el;
                      }}
                      className="w-full max-w-full overflow-hidden shrink-0"
                    >
                      <motion.button
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.06 + index * 0.04,
                          ease: [0.2, 0, 0, 1],
                        }}
                        className={`nav-link-btn group flex flex-col items-start gap-1 w-full max-w-full text-left interactive-item ${
                          location.pathname === item.path ? "active" : ""
                        }`}
                      >
                        <span
                          className={`font-heading text-[11vw] sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] transition-all duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] max-w-full break-words ${
                            location.pathname === item.path
                              ? "text-copper"
                              : "text-white/40 group-hover:text-white"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="font-body text-[10px] tracking-[0.25em] text-copper/70 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {item.label}
                        </span>
                      </motion.button>
                    </div>
                  ))}
                </nav>

                <p className="mt-12 md:mt-16 font-body text-[10px] tracking-[0.35em] text-white/20 uppercase hidden sm:block">
                  Ride Together · Stand Together · BUC India
                </p>
              </div>
            </div>

            {/* Footer — LOGIN & REGISTER on the left, clear of CLOSE */}
            <footer className="relative z-20 flex-none w-full max-w-full overflow-x-hidden border-t border-white/5 bg-carbon/95 backdrop-blur-md">
              <div className="h-px w-full bg-gradient-to-r from-copper/40 via-copper/20 to-transparent" />
              <div className="flex items-center justify-start gap-4 sm:gap-8 px-6 sm:px-10 py-4 sm:py-5 pr-20 sm:pr-28 max-w-full">
                {!isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { type: "login" } }));
                        setIsOpen(false);
                      }}
                      className="group relative font-body text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/50 hover:text-white transition-colors py-2 shrink-0"
                    >
                      LOGIN
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-copper group-hover:w-full transition-all duration-500" />
                    </button>

                    <span className="text-white/10 hidden sm:inline">|</span>

                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { type: "signup" } }));
                        setIsOpen(false);
                      }}
                      className="px-5 sm:px-8 py-2.5 sm:py-3 border border-copper/40 text-copper font-heading text-sm sm:text-base tracking-widest uppercase hover:bg-copper hover:text-carbon transition-all duration-300 shrink-0"
                    >
                      REGISTER
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNavigate("/profile")}
                    className="px-5 sm:px-8 py-2.5 sm:py-3 border border-copper/40 text-copper font-heading text-sm sm:text-base tracking-widest uppercase hover:bg-copper hover:text-carbon transition-all duration-300 shrink-0"
                  >
                    PROFILE
                  </button>
                )}
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
