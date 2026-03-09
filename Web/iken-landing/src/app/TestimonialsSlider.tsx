"use client";

import Image from "next/image";

const TESTIMONIALS = [
  {
    name: "Youssef Abdelrahman",
    title: "Corporate Senior Project Manager, EFG Hermes",
    image: "/testimonials/tm-efg.svg",
    quote:
      "We have had the pleasure of utilizing the conference system developed by IKEN Technology for several years now, and it has been an absolute game-changer for our organization.",
  },
  {
    name: "Mohammed Assem",
    title: "CTO & Co-founder, Balad",
    image: "/testimonials/tm-balad.svg",
    quote:
      "IKEN Technology has truly exceeded our expectations. Their customized software solutions have streamlined our operations and provided a significant boost in productivity.",
  },
  {
    name: "Waleed Kamel",
    title: "Managing Director, contactcars.com",
    image: "/testimonials/tm-contactcars.svg",
    quote:
      "We have collaborated with IKEN for a decade as a third-party software provider, successfully executing numerous projects across various technology platforms and business domains.",
  },
];

export function TestimonialsSlider() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f5fae]">
          Client stories
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-[#112d5c] sm:text-3xl">
          What Our Partners Say
        </h2>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[#536c92]">
          Trusted by leading brands across Egypt and the region.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <article
            key={testimonial.name}
            className="flex flex-col items-center rounded-3xl border border-[#dce8fb] bg-white px-6 py-7 text-center shadow-[0_14px_36px_rgba(20,67,136,0.12)]"
          >
            <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-[#9bc0ff] bg-[#eef5ff]">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={120}
                height={120}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm leading-relaxed text-[#425a80]">{testimonial.quote}</p>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-semibold text-[#17345d]">{testimonial.name}</p>
              <p className="text-xs text-[#6c83a7]">{testimonial.title}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
