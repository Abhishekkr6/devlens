"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";

export function DashboardBackground() {
  const [mounted, setMounted] = useState(false);

  // Mouse tracking logic for interactive dots
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the mouse movement slightly for a premium feel
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const interactiveMaskImage = useMotionTemplate`radial-gradient(150px circle at ${smoothX}px ${smoothY}px, black, transparent)`;

  if (!mounted) {
    // Return static version for SSR to prevent hydration mismatch
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-brand/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. Subtle Deep Dot Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.75' fill='%23ffffff'/%3E%3C/svg%3E")`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      
      {/* Interactive Bright Dot Overlay (Follows Mouse) */}
      <motion.div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.75' fill='%23ffffff'/%3E%3C/svg%3E")`,
          backgroundSize: "32px 32px",
          maskImage: interactiveMaskImage,
          WebkitMaskImage: interactiveMaskImage,
        }}
      />

      {/* 2. Aurora Orbs */}
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full bg-brand/10 blur-[120px] opacity-90"
        style={{ top: '-20%', left: '-10%', willChange: 'transform' }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.02, 0.98, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="absolute w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px] opacity-80"
        style={{ top: '40%', right: '-15%', willChange: 'transform' }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -10, 0],
          scale: [1, 0.98, 1.02, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }}
      />

      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[100px] opacity-60"
        style={{ bottom: '-10%', left: '20%', willChange: 'transform' }}
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -20, 10, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          delay: 5
        }}
      />

      {/* 3. Horizontal Scanner Sweep */}
      {/* Sharp scanning line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/80 to-transparent blur-[1px]"
        style={{ willChange: 'transform' }}
        animate={{ translateY: ["-10vh", "110vh"] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 6
        }}
      />
      {/* Scanner trail fade */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent to-brand/[0.05] pointer-events-none"
        style={{ willChange: 'transform' }}
        animate={{ translateY: ["-20vh", "110vh"] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 6
        }}
      />
    </div>
  );
}
