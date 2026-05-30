import React, { useEffect, useRef, useState } from "react";

const getCursorTier = () => {
  if (typeof window === "undefined") return "off";
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (coarse) return "off";

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduce) return "off";

  const w = window.innerWidth || 0;
  // Enable custom cursor from md/desktop upwards
  if (w < 1024) return "off";
  return "bike";
};

const CustomCursor = () => {
  const iconRef = useRef(null);
  const rafRef = useRef(0);
  const lastRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0, fx: 0, fy: 0 });
  const [tier, setTier] = useState(() => getCursorTier());
  const enabled = tier !== "off";

  useEffect(() => {
    const handleResize = () => setTier(getCursorTier());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const icon = iconRef.current;
    if (!icon) return;

    let idleTimeout = 0;

    const onMove = (e) => {
      lastRef.current.x = e.clientX;
      lastRef.current.y = e.clientY;
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(tick);
      icon.dataset.moving = "1";
      if (idleTimeout) window.clearTimeout(idleTimeout);
      idleTimeout = window.setTimeout(() => {
        icon.dataset.moving = "0";
      }, 220);
    };

    const onOver = (e) => {
      const target = e.target;
      const interactive = target?.closest?.(
        "button, a, input, textarea, select, [role='button'], .interactive-item",
      );
      icon.dataset.hover = interactive ? "1" : "0";
    };

    const onDown = () => {
      icon.dataset.click = "1";
    };

    const onUp = () => {
      icon.dataset.click = "0";
    };

    const tick = () => {
      rafRef.current = 0;
      const { x, y } = lastRef.current;
      const p = posRef.current;

      // initialize to avoid long travel from (0,0)
      if (p.fx === 0 && p.fy === 0) {
        p.fx = x;
        p.fy = y;
      }

      // smoother follow, closer to native cursor
      p.fx += (x - p.fx) * 0.35;
      p.fy += (y - p.fy) * 0.35;

      icon.style.transform = `translate3d(${p.fx}px, ${p.fy}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [enabled, tier]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={iconRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] select-none buc-cursor"
        style={{
          transform: "translate3d(0,0,0) translate(-50%,-50%)",
          opacity: 0.55,
          filter: "drop-shadow(0 0 4px rgba(0,0,0,0.7))",
          willChange: "transform",
        }}
        >
        {/* core rider bike (aligned with pointer) - pure white minimal icon */}
        <span
          style={{
            position: "relative",
            display: "inline-block",
            width: 20,
            height: 14,
          }}
        >
          {/* wheels */}
          <span
            style={{
              position: "absolute",
              bottom: 0,
              left: 1,
              width: 6,
              height: 6,
              borderRadius: "999px",
              border: "2px solid #ffffff",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 1,
              width: 6,
              height: 6,
              borderRadius: "999px",
              border: "2px solid #ffffff",
            }}
          />
          {/* frame */}
          <span
            style={{
              position: "absolute",
              left: 4,
              bottom: 4,
              width: 12,
              height: 2,
              background: "#ffffff",
              borderRadius: 999,
            }}
          />
          {/* seat / rider */}
          <span
            style={{
              position: "absolute",
              left: 8,
              bottom: 8,
              width: 6,
              height: 3,
              background: "#ffffff",
              borderRadius: 999,
            }}
          />
        </span>
        {/* exhaust flame + pack: only while moving & not clicking */}
        <span
          className="cursor-flame"
          style={{
            position: "absolute",
            right: "70%",
            top: "55%",
            width: 10,
            height: 10,
            borderRadius: "999px",
            background:
              "radial-gradient(circle at 30% 30%, #ffe38a 0%, #ff9e2c 45%, rgba(255,158,44,0) 70%)",
            opacity: 0,
            boxShadow: "0 0 10px rgba(255,158,44,0.8)",
            transition: "opacity 120ms ease",
          }}
        >
        </span>
        <span
          className="cursor-pack"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            marginLeft: 2,
            fontSize: 13,
            opacity: 0,
            transform: "translateX(-6px) scale(0.9)",
            transition: "opacity 150ms ease, transform 150ms ease",
          }}
        >
          <span>🏍️🏍️</span>
          <span style={{ fontSize: 11 }}>👥</span>
        </span>
      </div>
      <style>{`
        .buc-cursor[data-hover="1"] .cursor-pack {
          opacity: 0.9;
          transform: translateX(0) scale(1);
        }
        .buc-cursor[data-moving="1"][data-click="0"] .cursor-flame {
          opacity: 0.9;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
