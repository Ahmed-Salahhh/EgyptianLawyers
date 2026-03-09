"use client";

import { motion } from "framer-motion";
import { ClientsSlider } from "../ClientsSlider";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function ClientsSection() {
  return (
    <motion.section
      id="clients"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fade}
      transition={{ duration: 0.45 }}
      className="pb-18"
    >
      <div className="mb-7 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f5fae]">Trusted By</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#112d5c]">Partners & Brands</h2>
      </div>
      <ClientsSlider />
    </motion.section>
  );
}

