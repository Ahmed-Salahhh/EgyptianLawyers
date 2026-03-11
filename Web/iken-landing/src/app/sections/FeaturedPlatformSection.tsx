"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturedPlatformSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fade}
      transition={{ duration: 0.45 }}
      >
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-card)] backdrop-blur-xl shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-brand)]">Featured Platform</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">Orders and More - B2B Commerce Platform</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
              A modular B2B platform that centralizes catalog, orders, pricing, payments, delivery, and analytics in
              one operational system. Built for wholesalers and enterprise merchants who need control, visibility, and
              reliability.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-glass)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-brand)]">Architecture</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">Modular</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-glass)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-brand)]">Core Stack</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">B2B Commerce</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-glass)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-brand)]">Focus</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">Control & Visibility</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/docs/Orders-and-More-2026 1.pdf"
                target="_blank"
                className="rounded-full bg-[var(--color-brand-blue)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--color-brand-blue)]/80"
              >
                View Brochure
              </a>
              <a
                href="https://ordersandmore.com/contact"
                target="_blank"
                className="rounded-full border border-[var(--color-border-brand)] bg-[var(--color-bg-glass)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-brand)] transition hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-bg-glass-strong)]"
              >
                Book Demo
              </a>
            </div>
          </div>
          <div className="relative min-h-52 border-t border-[var(--color-border-light)] lg:min-h-full lg:border-l lg:border-t-0">
            <Image src="/products/p-contactcars.jpg" alt="Orders and More Platform" fill className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.6)_100%)] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.6)_100%)]" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

