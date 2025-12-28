/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import Link from "next/link";
import { cn } from "../../lib/utils";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type FloatingDockItem = {
  title: string;
  icon: ReactNode;
  href: string;
  isActive?: boolean;
};

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    // Restore scroll position
    const savedScroll = sessionStorage.getItem("mobile-dock-scroll");
    if (savedScroll) {
      element.scrollLeft = parseInt(savedScroll, 10);
    }

    const updateHints = () => {
      if (!element) {
        return;
      }
      const hasOverflow = element.scrollWidth > element.clientWidth + 4;
      if (!hasOverflow) {
        setShowLeftHint(false);
        setShowRightHint(false);
        return;
      }

      const atStart = element.scrollLeft <= 4;
      const atEnd =
        element.scrollLeft >= element.scrollWidth - element.clientWidth - 4;

      setShowLeftHint(!atStart);
      setShowRightHint(!atEnd);

      // Save scroll position
      sessionStorage.setItem("mobile-dock-scroll", element.scrollLeft.toString());
    };

    updateHints();
    const handleResize = () => updateHints();

    window.addEventListener("resize", handleResize);
    element.addEventListener("scroll", updateHints, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      element.removeEventListener("scroll", updateHints);
    };
  }, [items.length]);

  return (
    <nav
      className={cn(
        "relative block w-fit max-w-full rounded-2xl border border-border bg-background px-2 py-2 shadow-sm md:hidden",
        className,
      )}
      aria-label="Secondary navigation"
    >
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={scrollRef}
      >
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors",
              item.isActive
                ? "bg-brand text-white dark:bg-indigo-600 dark:text-white shadow-sm border border-white/20 dark:border-white/10"
                : "text-text-secondary hover:bg-surface hover:text-brand",
            )}
          >
            <span className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
              item.isActive
                ? "bg-white/20 text-white ring-white/20"
                : "bg-background text-text-secondary ring-border"
            )}>
              {item.icon}
            </span>
            <span className="whitespace-nowrap">{item.title}</span>
          </Link>
        ))}
      </div>
      {showLeftHint && (
        <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-white/10 shadow-lg transition-opacity duration-300">
          <ArrowIcon direction="left" />
        </div>
      )}
      {showRightHint && (
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-white/10 shadow-lg transition-opacity duration-300">
          <ArrowIcon direction="right" />
        </div>
      )}
    </nav>
  );
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-text-secondary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <>
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </>
      )}
    </svg>
  );
}

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(event) => mouseX.set(event.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 max-w-full items-end gap-4 rounded-2xl bg-surface/50 px-4 pb-3 md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  isActive,
}: {
  mouseX: MotionValue;
  title: string;
  icon: ReactNode;
  href: string;
  isActive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} className="group relative block">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 transition-colors z-8",
          hovered && "bg-slate-300 dark:bg-slate-700",
          isActive && "ring-2 ring-brand ring-offset-2 ring-offset-background",
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: -10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -2, x: "-50%" }}
              className="absolute top-[calc(100%+10px)] left-1/2 w-fit whitespace-pre rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-primary"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center text-slate-600 dark:text-slate-300"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
