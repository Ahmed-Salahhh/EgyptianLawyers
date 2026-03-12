"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const cyclingWords = ["Software", "Products", "Platforms", "Solutions"];

const marqueeItems = [
  "Custom Software",
  "Web & Mobile Apps",
  "E-Commerce Solutions",
  "Team as a Service",
  "Product Discovery",
  "Dev Partnership",
  "Enterprise Integration",
  "Maintenance & Support",
];

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIndex((i) => (i + 1) % cyclingWords.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">

      {/* ── Orb / glow field ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[38%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-blue)] opacity-[0.14] blur-[130px]" />
        <div className="absolute right-[-15%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--color-brand-blue)] opacity-[0.08] blur-[140px]" />
        <div className="absolute bottom-[5%] left-[-10%] h-[400px] w-[400px] rounded-full bg-[var(--color-brand-cyan)] opacity-[0.08] blur-[130px]" />

        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-text-primary) 1px,transparent 1px),linear-gradient(90deg,var(--color-text-primary) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_42%,transparent_35%,var(--color-bg-main)_100%)]" />
      </div>

      {/* ── Top badge strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 flex justify-center pt-28"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-glass)] px-4 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent-blue)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent-blue)]" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            IT &amp; Business Solutions · Est. 2018  · Cairo, Egypt
          </span>
        </div>
      </motion.div>

      {/* ── Main headline ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">

        {/* Pre-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mb-5 text-[13px] font-semibold uppercase tracking-[0.25em] text-[var(--color-text-brand)]"
        >
          Empowering Businesses Since 2018
        </motion.p>

        {/* Big headline with cycling word */}
        <div className="mb-7 overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3rem,8.5vw,7.5rem)] font-black leading-[1.0] tracking-tight"
          >
            <span className="text-[var(--color-text-primary)]">We Build&nbsp;</span>

            {/* Cycling word */}
            <span className="relative inline-flex overflow-hidden whitespace-nowrap">
              <AnimatePresence mode="wait">
                <motion.span
                  key={cyclingWords[wordIndex]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gradient-to-r from-[var(--color-brand-blue)] via-[var(--color-brand-cyan)] to-[var(--color-brand-blue)] bg-clip-text text-transparent"
                >
                  {cyclingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>

            <br />
            <span className="text-[var(--color-text-primary)]">That Drive Growth</span>
          </motion.h1>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.42 }}
          className="mb-10 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg"
        >
          From product discovery to full-scale delivery — IKEN engineers
          software, apps, and technology partnerships that scale with your
          ambitions.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52 }}
          className="mb-16 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/contact"
            className="rounded-full bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)] px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_22px_var(--color-brand-blue-glow)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_36px_var(--color-brand-blue-glow)] flex items-center justify-center"
          >
            Start a Project
          </Link>
          <a
            href="#projects"
            className="rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-glass)] px-8 py-3.5 text-sm font-bold text-[var(--color-text-primary)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-brand)] hover:bg-[var(--color-bg-glass-strong)] flex items-center justify-center"
          >
            View Our Work
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.62 }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-4 border-t border-[var(--color-border-light)] pt-8"
        >
          {[
            { v: "7+", l: "Years" },
            { v: "100+", l: "Projects" },
            { v: "50+", l: "Clients" },
            { v: "6", l: "Industries" },
          ].map(({ v, l }) => (
            <div key={l} className="text-center">
              <p className="bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)] bg-clip-text text-3xl font-black text-transparent">
                {v}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Services marquee strip ── */}
      <div className="relative z-10 overflow-hidden border-t border-[var(--color-border-light)] bg-[var(--color-bg-glass)] py-4 backdrop-blur-sm">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <span className="h-1 w-1 rounded-full bg-[var(--color-brand-blue)]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
