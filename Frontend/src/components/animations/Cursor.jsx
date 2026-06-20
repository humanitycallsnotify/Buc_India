import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const GlobalCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Different spring configurations to create the "snake/layer" trail effect
    // Layer 1 is the fastest (tightest spring)
    const springLayer1X = useSpring(mouseX, { damping: 20, stiffness: 500, mass: 0.1 });
    const springLayer1Y = useSpring(mouseY, { damping: 20, stiffness: 500, mass: 0.1 });

    // Layer 2
    const springLayer2X = useSpring(mouseX, { damping: 22, stiffness: 300, mass: 0.3 });
    const springLayer2Y = useSpring(mouseY, { damping: 22, stiffness: 300, mass: 0.3 });

    // Layer 3
    const springLayer3X = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
    const springLayer3Y = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

    // Layer 4 is the slowest (loosest spring)
    const springLayer4X = useSpring(mouseX, { damping: 30, stiffness: 120, mass: 0.8 });
    const springLayer4Y = useSpring(mouseY, { damping: 30, stiffness: 120, mass: 0.8 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            const interactive = target?.closest?.(
                "button, a, input, textarea, select, [role='button'], .interactive-item"
            );
            setIsHovering(!!interactive);
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mouseover", handleMouseOver, { passive: true });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [mouseX, mouseY]);

    // Disable on touch devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* Layer 4 - Largest, slowest */}
            <motion.div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    x: springLayer4X,
                    y: springLayer4Y,
                    translateX: "-50%",
                    translateY: "-50%",
                    rotate: 45,
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    opacity: isHovering ? 0 : 1
                }}
                className="w-10 h-10 border border-copper/20"
            />
            
            {/* Layer 3 */}
            <motion.div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    x: springLayer3X,
                    y: springLayer3Y,
                    translateX: "-50%",
                    translateY: "-50%",
                    rotate: 45,
                }}
                animate={{
                    scale: isHovering ? 1.4 : 1,
                    borderColor: isHovering ? "rgba(193, 154, 107, 0)" : "rgba(193, 154, 107, 0.4)"
                }}
                className="w-7 h-7 border border-copper/40"
            />

            {/* Layer 2 */}
            <motion.div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    x: springLayer2X,
                    y: springLayer2Y,
                    translateX: "-50%",
                    translateY: "-50%",
                    rotate: 45,
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    borderColor: isHovering ? "rgba(193, 154, 107, 0.3)" : "rgba(193, 154, 107, 0.7)"
                }}
                className="w-4 h-4 border-[1.5px] border-copper/70 bg-carbon/20"
            />

            {/* Layer 1 - Main point, fastest */}
            <motion.div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    x: springLayer1X,
                    y: springLayer1Y,
                    translateX: "-50%",
                    translateY: "-50%",
                    rotate: 45,
                }}
                animate={{
                    scale: isHovering ? 2 : 1,
                    backgroundColor: isHovering ? "rgba(193, 154, 107, 0.2)" : "rgba(193, 154, 107, 1)",
                    border: isHovering ? "1px solid rgba(193, 154, 107, 0.8)" : "none"
                }}
                className="w-2 h-2 bg-copper"
            />
        </div>
    );
};

export default GlobalCursor;
