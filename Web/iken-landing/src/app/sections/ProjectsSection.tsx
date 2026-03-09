"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const products = [
  {
    title: "Contact Cars",
    image: "/products/p-contactcars.jpg",
  },
  {
    title: "Furn",
    image: "/products/p-furn.jpg",
  },
  {
    title: "Home Care",
    image: "/products/p-homecare.jpg",
  },
  {
    title: "Moqawalat",
    image: "/products/p-moqawalat.jpg",
  },
];

export function ProjectsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = products.length;
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  return (
    <motion.section
      id="projects"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fade}
      transition={{ duration: 0.45 }}
      className="pb-24 pt-14 sm:pt-16"
    >
      <div className="mb-12 space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f5fae]">Some Top Projects</p>
        <h2 className="text-4xl font-semibold tracking-tight text-[#112d5c] sm:text-5xl">Our Recent Projects</h2>
      </div>

      <div className="relative p-1 sm:p-2">
        <div className="absolute right-1 top-1 z-20 sm:right-0 sm:top-0">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/70 text-xs font-bold text-white/90">
            i
          </span>
        </div>

        <div className="relative mx-auto flex h-[440px] max-w-5xl items-center justify-center sm:h-[500px]">
          <button
            type="button"
            onClick={() => setActiveIndex(prevIndex)}
            className="absolute left-0 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfe0fb] bg-white text-[#214f95] shadow-[0_8px_22px_rgba(20,63,130,0.16)] transition hover:bg-[#edf4ff]"
            aria-label="Previous project"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <article
            className="pointer-events-none absolute left-[10%] hidden w-[240px] overflow-hidden rounded-2xl border border-[#d5e6ff] bg-white/55 opacity-65 shadow-[0_16px_34px_rgba(24,67,132,0.12)] backdrop-blur-md blur-[4px] sm:block"
            style={{ transform: "perspective(900px) rotateY(30deg) scale(0.92)" }}
          >
            <div className="relative h-72">
              <Image src={products[prevIndex].image} alt={products[prevIndex].title} fill className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,56,0.26)_0%,rgba(8,25,56,0.55)_100%)]" />
            </div>
          </article>

          <article className="relative z-10 w-full max-w-[360px] overflow-hidden rounded-[20px] border border-[#d4e5ff] bg-white shadow-[0_24px_52px_rgba(21,62,128,0.25)]">
            <div className="relative h-64">
              <Image src={products[activeIndex].image} alt={products[activeIndex].title} fill className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,20,54,0.03)_0%,rgba(12,20,54,0.26)_100%)]" />
            </div>
            <div className="space-y-2 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5d69a9]">Slide {activeIndex + 1}</p>
              <h3 className="text-3xl font-semibold tracking-tight text-[#122f5b]">{products[activeIndex].title}</h3>
            </div>
          </article>

          <article
            className="pointer-events-none absolute right-[10%] hidden w-[240px] overflow-hidden rounded-2xl border border-[#d5e6ff] bg-white/55 opacity-65 shadow-[0_16px_34px_rgba(24,67,132,0.12)] backdrop-blur-md blur-[4px] sm:block"
            style={{ transform: "perspective(900px) rotateY(-30deg) scale(0.92)" }}
          >
            <div className="relative h-72">
              <Image src={products[nextIndex].image} alt={products[nextIndex].title} fill className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,56,0.26)_0%,rgba(8,25,56,0.55)_100%)]" />
            </div>
          </article>

          <button
            type="button"
            onClick={() => setActiveIndex(nextIndex)}
            className="absolute right-0 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfe0fb] bg-white text-[#214f95] shadow-[0_8px_22px_rgba(20,63,130,0.16)] transition hover:bg-[#edf4ff]"
            aria-label="Next project"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {products.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`rounded-full border transition-all ${
                idx === activeIndex
                  ? "h-3 w-9 border-[#1f5fbe] bg-[#1f5fbe] shadow-[0_0_0_4px_rgba(31,95,190,0.18)]"
                  : "h-3 w-3 border-[#9fbce9] bg-[#d8e6ff] hover:bg-[#c7dcff]"
              }`}
              aria-label={`Go to ${item.title}`}
            />
          ))}
        </div>
      </div>

      <p className="mx-auto mt-14 max-w-4xl text-center text-2xl font-medium leading-relaxed text-[#1b3358]">
        We Have Done More Than 20 Projects in Last 4 Years, With 100% Satisfaction.
      </p>
    </motion.section>
  );
}
