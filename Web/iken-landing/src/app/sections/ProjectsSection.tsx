"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, MouseEventHandler } from "react";
import Slider, { type Settings } from "react-slick";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const products = [
  {
    title: "ELAbd Patisserie",
    image: "/products/p-homecare.jpg",
    logo: "/clients/br-elabd.png",
    href: "/projects/elabd",
  },
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
      className="relative overflow-hidden bg-[var(--color-bg-main)] pb-24 pt-14 sm:pt-16"
    >
      {/* Background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-brand-blue)] opacity-[0.1] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-12 space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-brand)]">Some Top Projects</p>
          <h2 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            Our Recent <span className="bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)] bg-clip-text text-transparent">Projects</span>
          </h2>
        </div>

        <div className="projects-carousel mx-auto max-w-7xl px-0 sm:px-2">
          <Slider {...settings}>
            {products.map((project, idx) => (
              <div key={project.title} className="px-3 py-2" style={{ width: 420 }}>
                <article className="project-card relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[20px] border border-[var(--color-border-light)] bg-[var(--color-bg-card)] shadow-[0_24px_52px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                  <div className="relative h-64">
                    {project.logo ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-brand-deep)] to-[var(--color-bg-main)]">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,var(--color-brand-blue-glow),transparent)]" />
                        <div className="relative flex h-36 w-36 items-center justify-center rounded-2xl bg-white p-4 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_var(--color-brand-blue-glow)]">
                          <Image src={project.logo} alt={project.title} width={120} height={120} className="h-28 w-28 object-contain" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Image src={project.image} alt={project.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      </>
                    )}

                  </div>
                  <div className="flex items-center justify-between p-5">
                    <h3 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">{project.title}</h3>
                    {project.href && (
                      <Link href={project.href}
                        className="rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-blue-glow)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-brand)] transition-all hover:bg-[var(--color-brand-blue-glow)]/20">
                        Case Study →
                      </Link>
                    )}
                  </div>
                </article>
              </div>
            ))}
          </Slider>
        </div>

        <p className="mx-auto mt-20 max-w-4xl text-center text-2xl font-medium leading-relaxed text-[var(--color-text-secondary)]">
          We Have Done More Than 20 Projects in Last 4 Years, With 100% Satisfaction.
        </p>
      </div>
    </motion.section>
  );
}
