"use client";

import Image from "next/image";

const TESTIMONIALS = [
  {
    name: "Youssef Abdelrahman",
    title: "Corporate Senior Project Manager, EFG Hermes",
    company: "EFG Hermes",
    image: "/testimonials/tm-efg.jpg",
    quote:
      "We have had the pleasure of utilizing the conference system developed by IKEN Technology for several years now, and it has been an absolute game-changer for our organization.",
  },
  {
    name: "Mohammed Assem",
    title: "CTO & Co‑founder, Balad",
    company: "Balad",
    image: "/testimonials/tm-balad.jpg",
    quote:
      "IKEN Technology has truly exceeded our expectations. Their customized software solutions have streamlined our operations and provided a significant boost in productivity.",
  },
  {
    name: "Waleed Kamel",
    title: "Managing Director, contactcars.com",
    company: "contactcars.com",
    image: "/testimonials/tm-contactcars.jpg",
    quote:
      "We have collaborated with IKEN for a decade as a third‑party software provider, successfully executing numerous projects across various technology platforms and business domains.",
  },
];

export function TestimonialsSlider() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
          Client stories
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          What Our Partners Say
        </h2>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-slate-300">
          Trusted by leading brands across Egypt and the region.
        </p>
      </div>

      {/* Cards: avatar on top, text under it */}
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <article
            key={t.name}
            className="flex flex-col items-center rounded-3xl border border-slate-800/80 bg-slate-950 px-6 py-7 text-center shadow-[0_18px_60px_rgba(15,23,42,0.9)]"
          >
            <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-blue-400/70 bg-slate-900">
              <Image
                src={t.image}
                alt={t.name}
                width={120}
                height={120}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{t.quote}</p>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-semibold text-slate-50">{t.name}</p>
              <p className="text-xs text-slate-400">{t.title}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

