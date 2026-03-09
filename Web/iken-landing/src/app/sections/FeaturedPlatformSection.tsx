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
      className="pb-18"
    >
      <div className="overflow-hidden rounded-3xl border border-[#dbe8ff] bg-[linear-gradient(112deg,#f8fbff_0%,#eff6ff_56%,#e7f1ff_100%)] shadow-[0_14px_34px_rgba(30,72,137,0.1)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2d5ca7]">Featured Platform</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#113467]">Orders and More - B2B Commerce Platform</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4f678e]">
              A modular B2B platform that centralizes catalog, orders, pricing, payments, delivery, and analytics in
              one operational system. Built for wholesalers and enterprise merchants who need control, visibility, and
              reliability.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#cfe1fb] bg-white/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4f72a8]">Architecture</p>
                <p className="mt-1 text-sm font-semibold text-[#17325c]">Modular</p>
              </div>
              <div className="rounded-2xl border border-[#cfe1fb] bg-white/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4f72a8]">Core Stack</p>
                <p className="mt-1 text-sm font-semibold text-[#17325c]">B2B Commerce</p>
              </div>
              <div className="rounded-2xl border border-[#cfe1fb] bg-white/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4f72a8]">Focus</p>
                <p className="mt-1 text-sm font-semibold text-[#17325c]">Control & Visibility</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/docs/Orders-and-More-2026 1.pdf"
                target="_blank"
                className="rounded-full bg-[#1556d0] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#1249b4]"
              >
                View Brochure
              </a>
              <a
                href="https://ordersandmore.com/contact"
                target="_blank"
                className="rounded-full border border-[#bfd3f7] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#244780] transition hover:border-[#8fb3ee] hover:bg-[#f8fbff]"
              >
                Book Demo
              </a>
            </div>
          </div>
          <div className="relative min-h-52 border-t border-[#dbe8ff] lg:min-h-full lg:border-l lg:border-t-0">
            <Image src="/products/p-contactcars.jpg" alt="Orders and More Platform" fill className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,26,56,0.08)_0%,rgba(9,26,56,0.55)_100%)]" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

