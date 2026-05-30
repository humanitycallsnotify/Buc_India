import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import heroVideo from "../assets/gallery/WhatsApp Video 2025-08-09 at 21.21.40_0c2cbf8a.mp4";
import GlareHover from "./animations/GlareHover";

const SplitText = ({ text, className, id }) => {
  return (
    <span id={id} className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{ perspective: "1000px" }}
        >
          <span className="split-char inline-block">
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const { isLoading } = useOutletContext();
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("userLoggedIn") === "true",
  );
  const containerRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);
  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const loginHandler = () =>
      setIsLoggedIn(sessionStorage.getItem("userLoggedIn") === "true");
    window.addEventListener("user-login-change", loginHandler);

    if (!isLoading) {
      // Advanced Loading Timeline - Optimized for synchronized reveal
      const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });

      tl.fromTo(
        ".split-char",
        {
          y: 60,
          opacity: 0,
          rotateX: -45,
          skewX: 10,
          filter: "blur(10px)",
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          skewX: 0,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.015,
          ease: "expo.out",
        },
        "+=0.8", // Wait for split curtains to open significantly
      )
        .fromTo(
          contentRef.current.querySelectorAll(".reveal-item"),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" },
          "-=0.5",
        )
        .fromTo(
          videoRef.current,
          { filter: "brightness(0) grayscale(1)" },
          { filter: "brightness(0.65) grayscale(0.6)", duration: 2 },
          "-=1.5",
        );
    }

    // Spotlight Movement
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          x: clientX,
          y: clientY,
          duration: 1.5,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Kinetic Color-Shift Animation (3s transition cycles)
    const colorTl = gsap.timeline({ repeat: -1 });
    colorTl
      .to(
        "#hero-together-top",
        { color: "#ffffff", duration: 1.5, ease: "power2.inOut" },
        "+=3",
      )
      .to(
        "#hero-together-bottom",
        { color: "#C19A6B", duration: 1.5, ease: "power2.inOut" },
        "<",
      )
      .to(
        "#hero-together-top",
        { color: "#C19A6B", duration: 1.5, ease: "power2.inOut" },
        "+=3",
      )
      .to(
        "#hero-together-bottom",
        { color: "#ffffff", duration: 1.5, ease: "power2.inOut" },
        "<",
      );

    return () => {
      window.removeEventListener("user-login-change", loginHandler);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isLoading]);

  const handleJoinClick = () => {
    navigate("/register");
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-carbon"
    >
      {/* Moving Glow Style */}
      <style>{`
        .moving-glow {
          background: linear-gradient(to right, #ffffff00 0%, #C19A6B88 50%, #ffffff00 100%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          animation: glowMove 8s linear infinite;
        }
        @keyframes glowMove {
          0% { background-position: -100% center; }
          100% { background-position: 100% center; }
        }
      `}</style>

      {/* Hero Background Spotlight Glare - Subtler & Softer */}
      <div
        ref={spotlightRef}
        className="fixed top-0 left-0 w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(circle, rgba(193, 154, 107, 0.06) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Loading Curtains - Optimized with Framer Motion and GPU Acceleration */}
      <motion.div
        ref={curtainLeftRef}
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 1.7, ease: [0.85, 0, 0.15, 1] }}
        className="absolute inset-0 left-0 w-1/2 bg-carbon z-[60] border-r border-white/5 will-change-transform"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      ></motion.div>
      <motion.div
        ref={curtainRightRef}
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.7, ease: [0.85, 0, 0.15, 1] }}
        className="absolute inset-0 right-0 left-1/2 w-1/2 bg-carbon z-[60] border-l border-white/5 will-change-transform"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      ></motion.div>

      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover contrast-125"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-carbon/60 via-transparent to-carbon/60"></div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl w-full pt-20"
      >
        {/* Top Label */}
        <div className="reveal-item flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-copper"></div>
          <span className="font-body text-copper tracking-[0.4em] text-[10px] md:text-xs uppercase font-bold">
            India's Premier Riding Community
          </span>
          <div className="h-[1px] w-12 bg-copper"></div>
        </div>

        {/* Main Heading */}
        <div className="flex flex-col gap-0 mb-10 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-center md:gap-4 overflow-hidden relative">
            <SplitText
              text="RIDE"
              className="font-heading text-[12vw] md:text-[100px] lg:text-[130px] leading-tight text-white uppercase moving-glow"
            />
            <SplitText
              id="hero-together-top"
              text="TOGETHER."
              className="font-heading text-[12vw] md:text-[100px] lg:text-[130px] leading-tight text-copper uppercase moving-glow"
            />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:gap-4 -mt-4 overflow-hidden relative">
            <SplitText
              text="STAND"
              className="font-heading text-[12vw] md:text-[100px] lg:text-[130px] leading-tight text-white uppercase moving-glow"
            />
            <SplitText
              id="hero-together-bottom"
              text="TOGETHER."
              className="font-heading text-[12vw] md:text-[100px] lg:text-[130px] leading-tight text-white uppercase moving-glow"
            />
          </div>
        </div>

        {/* Subtext */}
        <p className="reveal-item font-body text-white/70 max-w-3xl mb-12 text-sm md:text-lg font-medium leading-relaxed tracking-wide">
          Where passion meets the pavement. Join a community of riders from
          around the world who share the love for the open road, adventure, and
          the unbreakable bonds forged on two wheels.
        </p>

        {/* Buttons */}
        <div className="reveal-item flex flex-col md:flex-row items-center justify-center gap-6">
          {!isLoggedIn && (
            <div className="interactive-item overflow-hidden">
              <GlareHover
                borderRadius="0"
                glareColor="#C19A6B"
                glareOpacity={0.2}
              >
                <button
                  onClick={handleJoinClick}
                  className="group relative px-12 py-4 bg-transparent border border-copper/50 text-white font-body font-bold uppercase tracking-widest text-sm overflow-hidden transition-all duration-500"
                >
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-carbon">
                    Join The Brotherhood
                  </span>
                  <div className="absolute inset-0 bg-copper translate-x-[-105%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]"></div>
                </button>
              </GlareHover>
            </div>
          )}
          <button
            onClick={() => navigate("/events")}
            className="font-body text-white/50 hover:text-white transition-colors tracking-[0.3em] text-xs md:text-sm border-b border-white/10 pb-1 interactive-item"
          >
            EXPLORE RIDES
          </button>
        </div>
      </div>

      {/* Scroll Indicator - Pill Shape */}
      <div className="reveal-item absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10">
        <div className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 bg-copper rounded-full"
          />
        </div>
        <span className="text-[8px] tracking-[0.4em] uppercase text-white/20 font-body">
          Scroll
        </span>
      </div>
    </section>
  );
};

export default Hero;
