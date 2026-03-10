"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { CSSProperties, MouseEventHandler } from "react";
import Slider, { type Settings } from "react-slick";

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

function CarouselArrow({
  className,
  style,
  onClick,
  direction,
}: {
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  direction: "prev" | "next";
  currentSlide?: number;
  slideCount?: number;
}) {
  return (
    <button type="button" className={`${className ?? ""} project-arrow`} style={style} onClick={onClick}>
      {direction === "prev" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export function ProjectsSection() {
  const settings: Settings = {
    infinite: true,
    speed: 520,
    cssEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    arrows: true,
    dots: true,
    centerMode: true,
    centerPadding: "0px",
    variableWidth: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    customPaging: () => <span className="project-dot" />,
    prevArrow: <CarouselArrow direction="prev" />,
    nextArrow: <CarouselArrow direction="next" />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          centerPadding: "0px",
          variableWidth: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          centerPadding: "0px",
          variableWidth: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          centerMode: false,
          variableWidth: false,
          centerPadding: "0px",
        },
      },
    ],
  };

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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f5fae]">Some Top Projects</p>
        <h2 className="text-4xl font-semibold tracking-tight text-[#112d5c] sm:text-5xl">
          Our Recent <span className="bg-gradient-to-r from-[#2f5fae] to-[#6366f1] bg-clip-text text-transparent">Projects</span>
        </h2>
      </div>

      <div className="projects-carousel mx-auto max-w-7xl px-0 sm:px-2">
        <Slider {...settings}>
          {products.map((project, idx) => (
            <div key={project.title} className="px-3 py-2" style={{ width: 420 }}>
              <article className="project-card relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[20px] border border-[#d4e5ff] bg-white shadow-[0_24px_52px_rgba(21,62,128,0.25)]">
                <div className="relative h-64">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,20,54,0.03)_0%,rgba(12,20,54,0.26)_100%)]" />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-3xl font-semibold tracking-tight text-[#122f5b]">{project.title}</h3>
                </div>
              </article>
            </div>
          ))}
        </Slider>
      </div>

      <p className="mx-auto mt-20 max-w-4xl text-center text-2xl font-medium leading-relaxed text-[#1b3358]">
        We Have Done More Than 20 Projects in Last 4 Years, With 100% Satisfaction.
      </p>
    </motion.section>
  );
}
