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
    autoplay: true,
    autoplaySpeed: 3000,
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
      className="relative overflow-hidden bg-[#080e1a] pb-24 pt-14 sm:pt-16"
    >
      {/* Background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-12 space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Some Top Projects</p>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Our Recent <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Projects</span>
          </h2>
        </div>

        <div className="projects-carousel mx-auto max-w-7xl px-0 sm:px-2">
          <Slider {...settings}>
            {products.map((project, idx) => (
              <div key={project.title} className="px-3 py-2" style={{ width: 420 }}>
                <article className="project-card relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[20px] border border-white/8 bg-[#0d1525]/80 shadow-[0_24px_52px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                  <div className="relative h-64">
                    <Image src={project.image} alt={project.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,15,24,0.05)_0%,rgba(10,15,24,0.55)_100%)]" />
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="text-2xl font-semibold tracking-tight text-white">{project.title}</h3>
                  </div>
                </article>
              </div>
            ))}
          </Slider>
        </div>

        <p className="mx-auto mt-20 max-w-4xl text-center text-2xl font-medium leading-relaxed text-slate-300">
          We Have Done More Than 20 Projects in Last 4 Years, With 100% Satisfaction.
        </p>
      </div>
    </motion.section>
  );
}
