import { useState } from "react";
import { motion } from "framer-motion";
import { GlowingOrbDashedClients } from "../GlowingOrbDashedClients";

export function ClientsSection() {
  return (
    <section 
      id="clients" 
      className="relative py-24 bg-[#080e1a] overflow-hidden"
    >
      {/* Dark Ambient Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_80%)]" />
      </div>

      <div className="container relative mx-auto px-4 mb-20 text-center z-10">
        <div className="space-y-4 px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Partnership
          </p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-semibold tracking-tight sm:text-5xl text-white"
          >
            Our Trusted <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Clients</span>
          </motion.h2>
        </div>
      </div>

      {/* Finalized Constellation Display (Dark ONLY) */}
      <div className="relative w-full z-10 min-h-[600px] md:min-h-[700px]">
        <div className="animate-in fade-in zoom-in-95 duration-1000">
          <GlowingOrbDashedClients />
        </div>
      </div>
    </section>
  );
}
