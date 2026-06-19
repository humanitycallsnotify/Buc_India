import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const GlobalCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = "none";
    
    const moveCursor = (e) => {
      if (!isVisible) setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const interactive = target?.closest?.(
        "button, a, input, textarea, select, [role='button'], .interactive-item"
      );
      setIsHovering(!!interactive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null; // Disable on touch devices
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-copper rounded-full pointer-events-none z-[10000]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-copper/50 rounded-full pointer-events-none z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0
        }}
        animate={{
          scale: isHovering ? 1.8 : 1,
          backgroundColor: isHovering ? "rgba(193, 154, 107, 0.15)" : "transparent",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.3 }}
      />
    </>
  );
};

export default GlobalCursor;
