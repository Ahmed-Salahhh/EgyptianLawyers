"use client";

import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fade}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-[#080e1a] px-4 py-20 text-white"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-transparent opacity-25 blur-3xl mix-blend-screen" />
        <div
          className="absolute bottom-0 left-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-transparent opacity-25 blur-3xl mix-blend-screen"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-orange-500 to-transparent opacity-15 blur-3xl mix-blend-screen"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl text-center">
        <div className="mb-8 inline-block">
          <span className="text-sm font-bold uppercase tracking-widest text-cyan-400">IKEN Technology</span>
        </div>

        <h1 className="mb-8 text-6xl font-black leading-none sm:text-7xl md:text-8xl">
          <span className="bg-gradient-to-r from-cyan-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Where Code
          </span>
          <br />
          <span className="text-white">Meets</span>
          <br />
          <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
            Creativity
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl">
          Software engineering that pushes boundaries. We deliver products with measurable outcomes across every
          dimension.
        </p>

        <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="#contact"
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-bold text-white transition-all hover:from-cyan-600 hover:to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            Start a Project
          </a>
          <a
            href="#projects"
            className="rounded-full border border-slate-400 px-8 py-4 font-bold text-white transition-all hover:border-cyan-400 hover:bg-slate-900"
          >
            View Portfolio
          </a>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-slate-700 pt-12 sm:gap-6">
          <div>
            <p className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
              10+
            </p>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">Years Experience</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
              20+
            </p>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">Projects Delivered</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
              24/7
            </p>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">Dedicated Support</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

