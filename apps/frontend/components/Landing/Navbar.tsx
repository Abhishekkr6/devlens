import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Github, Menu, X } from "lucide-react";
import { useUserStore } from "../../store/userStore";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUserStore();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navLinks = [
    { name: "Features", href: "/features", isScroll: false },
    { name: "Pricing", href: isHome ? "#pricing" : "/pricing", isScroll: isHome },
    { name: "How it works", href: "/how-it-works", isScroll: false },
  ];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isLoginModalOpen]);

  const handleLogin = () => {
    setIsLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHome) {
      e.preventDefault();
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center ${scrolled ? "pt-4 px-4" : "pt-0 px-0"
        }`}
    >
      <div
        className={`flex items-center justify-between mx-auto transition-all duration-500 ease-out ${scrolled
            ? "w-full max-w-5xl bg-background/90 md:bg-background/80 backdrop-blur-lg border border-border/50 rounded-full py-2.5 px-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            : "w-full max-w-7xl bg-transparent py-4 md:py-6 px-4 sm:px-6 lg:px-8 border-transparent rounded-none"
          }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <img
            src="/logo.svg"
            alt="DevLens"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-primary group-hover:from-brand group-hover:to-purple-400 transition-all duration-300 font-heading"
          >
            DevLens
          </span>
        </Link>

        {/* Desktop Nav Pills */}
        <div
          className="hidden md:flex items-center gap-2 bg-surface/80 md:bg-surface/40 backdrop-blur-md border border-border/60 px-2 py-1.5 rounded-full shadow-inner"
          onMouseLeave={() => setHoveredPath(null)}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={link.isScroll ? handlePricingClick : undefined}
              onMouseEnter={() => setHoveredPath(link.href)}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${hoveredPath === link.href ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
            >
              <span className="relative z-10">{link.name}</span>
              {hoveredPath === link.href && (
                <motion.div
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-white/[0.08] dark:bg-white/[0.06] border border-white/10 rounded-full -z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Login */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href="/organization"
              className="flex items-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-6 py-2 rounded-full text-sm font-bold transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-6 py-2 rounded-full text-sm font-bold transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <Github className="w-4 h-4" />
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-transform active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden absolute top-full left-0 right-0 shadow-2xl z-[50] bg-surface ${scrolled ? "mt-4 mx-4 rounded-3xl border border-border/50 overflow-hidden" : "border-b border-border"
              }`}
          >
            <div className="relative p-6 flex flex-col gap-5">
              <Link
                href="/features"
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href={isHome ? "#pricing" : "/pricing"}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handlePricingClick(e);
                }}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Pricing
              </Link>
              <Link
                href="/how-it-works"
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </Link>
              {user ? (
                <Link
                  href="/organization"
                  className="flex items-center justify-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-4 py-3.5 rounded-xl text-sm font-bold w-full active:scale-[0.98] transition-all shadow-lg mt-2"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center justify-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-4 py-3.5 rounded-xl text-sm font-bold w-full active:scale-[0.98] transition-all shadow-lg mt-2"
                >
                  <Github className="w-5 h-5" />
                  Login with GitHub
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal Overlay */}
      {mounted && createPortal(
        <AnimatePresence>
          {isLoginModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
              onClick={() => setIsLoginModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-purple-500/10 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-extrabold tracking-tight text-text-primary">Authentication</h3>
                    <button onClick={() => setIsLoginModalOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-full hover:bg-white/5">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm font-light text-text-secondary mb-8">
                    Choose how you want to proceed. You can always upgrade your workspace later.
                  </p>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => window.location.href = "/auth/github/login"}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-border text-text-primary font-bold hover:bg-surface hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Github className="w-5 h-5" /> Continue with Free
                    </button>
                    <button
                      onClick={() => { setIsLoginModalOpen(false); window.location.href = "/pricing"; }}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand to-violet-600 text-white font-bold hover:opacity-90 active:scale-95 hover:scale-105 transition-all shadow-lg shadow-brand/25 border border-brand/20 cursor-pointer"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
}
