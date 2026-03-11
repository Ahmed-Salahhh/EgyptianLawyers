"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function DeliveryFrameworkSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fade}
      transition={{ duration: 0.45 }}
      >
      <div className="grid gap-6 rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-card)] p-6 shadow-2xl backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-brand)]">Delivery Framework</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">How IKEN Executes</h2>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            We run each engagement through three clear stages to ensure focus, velocity, and product quality from day
            one.
          </p>
          <div className="space-y-2 pt-2">
            {[
              ["01", "Discover", "Business goals, user needs, and technical scope."],
              ["02", "Build", "Agile sprints with weekly delivery and reviews."],
              ["03", "Scale", "Optimization, monitoring, and continuous enhancements."],
            ].map(([num, title, desc]) => (
              <div key={num} className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-glass)] p-3">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {num} - {title}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {["/service/sr-3-1.jpg", "/service/sr-3-2.jpg", "/service/sr-3-5.jpg", "/service/sr-3-6.jpg"].map(
            (src, idx) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-2xl border border-[var(--color-border-light)] ${idx === 0 ? "col-span-2 h-44" : "h-36"}`}
              >
                <Image src={src} alt="IKEN delivery process" fill className="object-cover" />
              </div>
            ),
          )}
        </div>
      </div>
    </motion.section>
  );
}

