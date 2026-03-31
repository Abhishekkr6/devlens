"use client";

import React, { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

/* ─── Seeded pseudo-random (no SSR hydration mismatch) ───────────────────── */
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PARALLAX ORBS  — each in its own component so hooks aren't called in loops
   ═══════════════════════════════════════════════════════════════════════════ */
const ORB_DATA = [
  { baseX: 0.08, baseY: 0.12, r: 440, c: "74,93,255",  a: 0.13, blur: 110, factor:  45 },
  { baseX: 0.90, baseY: 0.80, r: 370, c: "168,85,247", a: 0.10, blur: 100, factor: -35 },
];

function SingleOrb({
  orb,
  mouseX,
  mouseY,
}: {
  orb: typeof ORB_DATA[number];
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  const tx = useTransform(mouseX, [0, 1], [-orb.factor, orb.factor]);
  const ty = useTransform(mouseY, [0, 1], [-orb.factor * 0.65, orb.factor * 0.65]);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${orb.baseX * 100}%`,
        top:  `${orb.baseY * 100}%`,
        width:  orb.r,
        height: orb.r,
        x: tx,
        y: ty,
        translateX: "-50%",
        translateY: "-50%",
        background: `radial-gradient(circle, rgba(${orb.c},${orb.a}) 0%, rgba(${orb.c},0) 70%)`,
        filter: `blur(${orb.blur}px)`,
        willChange: "transform",
      }}
    />
  );
}

function ParallaxOrbs({
  mouseX,
  mouseY,
}: {
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  return (
    <>
      {ORB_DATA.map((o, i) => (
        <SingleOrb key={i} orb={o} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AMBIENT LAYER  — grid + floating particles
   ═══════════════════════════════════════════════════════════════════════════ */
function AmbientLayer() {
  return (
    <>
      {/* Pulsing grid */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(74,93,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,93,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 90%)",
          willChange: "opacity",
        }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {Array.from({ length: 8 }, (_, i) => {
        const col = ["#818cf8", "#a78bfa", "#f472b6", "#60a5fa"][i % 4];
        const sz  = 1.2 + sr(i * 3) * 1.5;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left:  `${sr(i * 13) * 96 + 2}%`,
              top:   `${sr(i * 7)  * 100}%`,
              width:  sz,
              height: sz,
              backgroundColor: col,
              boxShadow: `0 0 ${sz * 2}px 1px ${col}`,
              willChange: "transform, opacity",
            }}
            animate={{ y: [0, -(250 + sr(i * 9) * 150)], opacity: [0, 0.45, 0] }}
            transition={{
              duration: 10 + sr(i * 5) * 12,
              delay:    sr(i * 11) * 7,
              repeat:   Infinity,
              ease:     "easeOut",
            }}
          />
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EDGE CARDS  (shown only in Hero section)
   ═══════════════════════════════════════════════════════════════════════════ */
function PRRiskCard({
  pr, title, risk, score, riskColor, riskBg, border, top, dur, delay,
}: {
  pr: string; title: string; risk: string; score: number;
  riskColor: string; riskBg: string; border: string;
  top: string; dur: number; delay: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: "-2px", top, zIndex: 3 }}
      animate={{
        x:       [0, 6, -4, 5, 0],
        y:       [0, -6, 4, -4, 0],
        opacity: [0.28, 0.45, 0.33, 0.45, 0.28],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="backdrop-blur-sm rounded-r-xl px-2.5 py-2 w-[170px]"
        style={{
          background:  "rgba(10,15,35,0.65)",
          border:      `1px solid ${border}`,
          borderLeft:  "none",
          boxShadow:   "4px 0 16px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 font-mono text-[9px]">PR {pr}</span>
          <span
            className="text-[8px] font-black px-1 py-0.5 rounded"
            style={{ color: riskColor, background: riskBg }}
          >
            {risk}
          </span>
        </div>
        <p className="text-slate-400 text-[9px] truncate mb-1.5">{title}</p>
        <div className="w-full h-[3px] bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: riskColor }} />
        </div>
      </div>
    </motion.div>
  );
}

function WebhookToastCard({
  event, repo, icon, color, top, dur, delay,
}: {
  event: string; repo: string; icon: string; color: string;
  top: string; dur: number; delay: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ right: "-2px", top, zIndex: 3 }}
      animate={{
        x:       [0, -5, 3, -4, 0],
        opacity: [0.28, 0.42, 0.30, 0.42, 0.28],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="backdrop-blur-sm rounded-l-xl px-2.5 py-2 flex items-center gap-2 w-[190px]"
        style={{
          background:   "rgba(10,15,35,0.65)",
          border:       `1px solid ${color}30`,
          borderRight:  "none",
        }}
      >
        <span className="text-[10px] flex-shrink-0" style={{ color }}>{icon}</span>
        <div className="min-w-0">
          <p className="text-slate-300 font-medium text-[9px] truncate">{event}</p>
          <p className="text-slate-600 text-[8px]">{repo} · just now</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MASTER — AnimatedBackground
   showCards → true only for Hero section
   ═══════════════════════════════════════════════════════════════════════════ */
export function AnimatedBackground({ showCards = false }: { showCards?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw mouse position (0–1, normalised to container)
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  // Damped springs — give the satisfying "lag behind" feeling
  const springCfg = { stiffness: 80, damping: 22, mass: 0.6 };
  const springX = useSpring(rawX, springCfg);
  const springY = useSpring(rawY, springCfg);

  // Spotlight background-position: "x% y%"
  const bgPos = useTransform(
    [springX, springY],
    ([lx, ly]: number[]) => `${lx * 100}% ${ly * 100}%`
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      rawX.set((e.clientX - rect.left) / rect.width);
      rawY.set((e.clientY - rect.top)  / rect.height);
    },
    [rawX, rawY]
  );

  // Gently drift back to centre when the cursor leaves the section
  const handleMouseLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
  }, [rawX, rawY]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Grid + particles */}
      <AmbientLayer />

      {/* 2. Orbs that parallax with the mouse */}
      <ParallaxOrbs mouseX={springX} mouseY={springY} />

      {/* 3. Cursor spotlight — smooth radial glow that follows the mouse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle 380px at center, rgba(74,93,255,0.12) 0%, rgba(168,85,247,0.06) 45%, transparent 75%)",
          backgroundRepeat:   "no-repeat",
          backgroundSize:     "760px 760px",
          backgroundPosition: bgPos as any,
          willChange:         "background-position",
        }}
      />

      {/* 4. Edge cards — only in Hero */}
      {showCards && (
        <>
          <PRRiskCard
            pr="#412"
            title="refactor: session auth"
            risk="HIGH"
            score={87}
            riskColor="#f43f5e"
            riskBg="rgba(244,63,94,0.12)"
            border="rgba(244,63,94,0.28)"
            top="26%"
            dur={18}
            delay={0}
          />
          <WebhookToastCard
            event="High-risk alert"
            repo="auth-service"
            icon="⚠"
            color="#f43f5e"
            top="46%"
            dur={15}
            delay={1}
          />
        </>
      )}
    </div>
  );
}

/* Named re-export so any file that imports AmbientBg still works */
export { AmbientLayer as AmbientBg };
