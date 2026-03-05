"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ClientsSlider } from "./ClientsSlider";
import { TestimonialsSlider } from "./TestimonialsSlider";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const transitionFast = { duration: 0.4, ease: "easeOut" as const };

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/40">
              <span className="text-lg font-semibold tracking-tight">IK</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-[0.18em] text-slate-100">
                IKEN
              </span>
              <span className="text-xs text-slate-500">Technology</span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#home" className="hover:text-white">
              Home
            </a>
            <a href="#services" className="hover:text-white">
              Services
            </a>
            <a href="#projects" className="hover:text-white">
              Projects
            </a>
            <a href="#clients" className="hover:text-white">
              Clients
            </a>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </nav>

          <a
            href="#projects"
            className="hidden rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500 md:inline-flex"
          >
            Our Portfolio
          </a>
        </div>
      </header>

      <main id="home" className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
        {/* Hero section – dark card layout */}
        <motion.section
          className="grid gap-12 pb-20 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={transitionFast}
        >
          <div className="space-y-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Collaborate together, build together
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Make Planning Build
              <br />
              Great Product!
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Our mission is to help businesses achieve their goals by providing
              innovative and scalable technology solutions. We partner with you
              from idea to execution, delivering reliable products and
              long‑term support.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500"
              >
                Request more info
              </a>
              <a
                href="#projects"
                className="inline-flex items-center justify-center rounded-full border border-slate-600/80 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:bg-slate-900/60"
              >
                View projects
              </a>
            </div>

            <dl className="mt-4 grid max-w-md grid-cols-3 gap-6 text-xs text-slate-300 sm:text-sm">
              <div>
                <dt className="font-semibold text-slate-50">10+ Years</dt>
                <dd className="mt-1 text-slate-400">Experience in IT delivery</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-50">
                  20+ Projects
                </dt>
                <dd className="mt-1 text-slate-400">
                  Delivered with full satisfaction
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-50">24/7</dt>
                <dd className="mt-1 text-slate-400">
                  Dedicated support & monitoring
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -translate-x-10 translate-y-4 rounded-[36px] bg-blue-600/25 blur-3xl" />
            <div className="relative rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                  Trusted IT & Business Partner
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Since 2015
                </span>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-900/60" />
                <div className="relative flex h-52 items-center justify-center sm:h-56">
                  <Image
                    src="/window.svg"
                    alt="Business planning illustration"
                    width={260}
                    height={180}
                    className="opacity-80"
                    priority
                  />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3">
                  <p className="text-[11px] font-semibold text-slate-100">
                    Strategy & Analysis
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Clarify the vision and roadmap for your product.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3">
                  <p className="text-[11px] font-semibold text-slate-100">
                    Product Delivery
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Ship high‑quality releases on a predictable cadence.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3">
                  <p className="text-[11px] font-semibold text-slate-100">
                    Ongoing Support
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Keep systems secure, scalable, and up to date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured services */}
        <motion.section
          id="services"
          className="space-y-8 pb-20"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.15 }}
          transition={transitionFast}
        >
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Our featured services
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              We Provide Great IT & Business Solutions
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300">
              From mobile apps to enterprise platforms, we deliver tailored
              solutions that drive measurable results and long‑term growth for
              your organization.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Mobile Management",
                description:
                  "Robust mobile applications and management tools for modern teams.",
              },
              {
                title: "Enterprise Solutions",
                description:
                  "Scalable systems engineered around your core business processes.",
              },
              {
                title: "Software Support",
                description:
                  "Reliable support, enhancements, and lifecycle management.",
              },
              {
                title: "Team as a Service",
                description:
                  "Dedicated agile teams to accelerate your digital roadmap.",
              },
            ].map((service) => (
              <article
                key={service.title}
                className="group rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.85)] transition hover:border-blue-500/70 hover:shadow-[0_24px_80px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-blue-300 ring-1 ring-slate-700/90">
                  IT
                </div>
                <h3 className="text-sm font-semibold text-slate-50">
                  {service.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </motion.section>

        {/* Recent projects */}
        <motion.section
          id="projects"
          className="space-y-10 pb-20"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.15 }}
          transition={transitionFast}
        >
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Some top projects
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Our Recent Projects
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300">
              We have delivered more than 20 projects in the last 4 years with
              100% client satisfaction across diverse industries.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {["Contact Cars", "Furn", "Home Care", "Moqa walat"].map(
              (project) => (
                <article
                  key={project}
                  className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-950 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5"
                >
                  <div className="flex-1 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
                    <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
                      <Image
                        src="/file.svg"
                        alt={project}
                        width={72}
                        height={72}
                        className="opacity-80"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-center text-sm font-semibold text-slate-50">
                    {project}
                  </div>
                </article>
              ),
            )}
          </div>

          {/* Highlight: Orders and More */}
          <div className="grid gap-8 rounded-3xl border border-slate-800/80 bg-slate-950 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.95)] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                Featured product
              </p>
              <h3 className="text-xl font-semibold text-slate-50">
                Orders and More – B2B E‑Commerce Platform
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                A modern, modular B2B platform that centralizes catalog, orders, pricing,
                payments, delivery, and analytics into one powerful system. Built for
                wholesalers, retailers, and enterprise merchants who need complete control
                and enterprise‑grade scalability.
              </p>
              <ul className="mt-2 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                <li>• Eight integrated modules covering end‑to‑end operations</li>
                <li>• Enterprise‑grade security, performance, and reliability</li>
                <li>• Flexible pricing models: cloud, license, and enterprise</li>
                <li>• Backed by IKEN&apos;s dedicated Team‑as‑a‑Service squad</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/docs/orders-and-more.pdf"
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500"
                >
                  View full brochure
                </a>
                <a
                  href="https://ordersandmore.com/contact"
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100 transition hover:border-blue-400 hover:bg-slate-900/60"
                >
                  Book a live demo
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.4),_transparent_55%)]" />
                <div className="relative flex h-full flex-col justify-between p-4 text-xs text-slate-200">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
                      Total control
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">
                      One Platform, Complete Control
                    </p>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <p>• Vendor & catalog management</p>
                    <p>• Pricing & discounts engine</p>
                    <p>• Delivery & shipping management</p>
                    <p>• Real‑time analytics & reporting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Case study + company profile (from other PDFs) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* ElAbd case study */}
            <article className="space-y-3 rounded-3xl border border-slate-800/80 bg-slate-950 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.8)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                Case study
              </p>
              <h3 className="text-base font-semibold text-slate-50">
                IKEN x ElAbd – TaaS Partnership
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                How a dedicated Team‑as‑a‑Service squad became ElAbd&apos;s embedded
                tech arm, accelerating e‑commerce delivery, launching internal
                platforms, and supporting multiple departments with one integrated team.
              </p>
              <ul className="mt-1 space-y-1 text-xs text-slate-300">
                <li>• 45% faster time‑to‑market for e‑commerce features</li>
                <li>• 30% increase in online order volume</li>
                <li>• 5+ departments supported and 200+ employees trained</li>
              </ul>
              <a
                href="/docs/iken-elabd-showcase.pdf"
                target="_blank"
                className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100 transition hover:border-blue-400 hover:bg-slate-900/60"
              >
                View full case study
              </a>
            </article>

            {/* IKEN company profile */}
            <article className="space-y-3 rounded-3xl border border-slate-800/80 bg-slate-950 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.8)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                About IKEN
              </p>
              <h3 className="text-base font-semibold text-slate-50">
                IKEN Technology – Team, Services & Industries
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Snapshot of our core services, TaaS and development partnership models,
                and the industries we serve—from fintech and automotive to healthcare
                and logistics.
              </p>
              <ul className="mt-1 space-y-1 text-xs text-slate-300">
                <li>• 7+ years of experience delivering digital products</li>
                <li>• Custom software, web & mobile, and e‑commerce solutions</li>
                <li>• Team‑as‑a‑Service and long‑term development partnerships</li>
              </ul>
              <a
                href="/docs/iken-technology.pdf"
                target="_blank"
                className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100 transition hover:border-blue-400 hover:bg-slate-900/60"
              >
                Download company profile
              </a>
            </article>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          className="space-y-8 pb-20"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.15 }}
          transition={transitionFast}
        >
          <TestimonialsSlider />
        </motion.section>

        {/* Work process */}
        <motion.section
          className="space-y-8 pb-20"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.15 }}
          transition={transitionFast}
        >
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Our work process
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Work With Planning
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Analysis",
                description:
                  "Understand what the software needs to do and who will be using it.",
              },
              {
                step: "02",
                title: "We Build and Create",
                description:
                  "Turn validated ideas into reliable, user‑friendly digital products.",
              },
              {
                step: "03",
                title: "Faster Delivery",
                description:
                  "Break down work into small, iterative cycles for faster value.",
              },
            ].map((item) => (
              <article
                key={item.step}
                className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-500/40">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </motion.section>

        {/* Clients */}
        <motion.section
          id="clients"
          className="space-y-8 pb-20"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.15 }}
          transition={transitionFast}
        >
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Our trusted clients
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Brands Who Trust IKEN
            </h2>
          </div>

          <ClientsSlider />
        </motion.section>

        {/* Contact / Footer */}
        <motion.section
          id="contact"
          className="space-y-8 rounded-3xl border border-slate-800/80 bg-slate-950 px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.95)] sm:px-10"
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.1 }}
          transition={transitionFast}
        >
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-50">
                Need a consultation?
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                We are here to answer your questions 24/7. Share your ideas and
                we&apos;ll help you turn them into a scalable, production‑ready
                solution.
              </p>
              <a
                href="mailto:contact@iken.tech"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500"
              >
                Get a quote
              </a>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Office Address
                </p>
                <p className="mt-1">
                  22x, Tharwat Abu El Gouk Street, Maadi, Cairo, Egypt
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Working Hours
                </p>
                <p className="mt-1">Sunday – Thursday, 8:00 AM – 7:00 PM</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Contact
                </p>
                <p className="mt-1">
                  <a
                    href="mailto:contact@iken.tech"
                    className="hover:text-blue-300"
                  >
                    contact@iken.tech
                  </a>{" "}
                  ·{" "}
                  <a
                    href="tel:+201050500017"
                    className="hover:text-blue-300"
                  >
                    (+20) 105 0500017
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-500 sm:flex-row">
            <p>Copyright © {new Date().getFullYear()} IKEN Technology.</p>
            <div className="flex gap-4">
              <a href="#services" className="hover:text-slate-300">
                Our Services
              </a>
              <a href="#projects" className="hover:text-slate-300">
                Our Projects
              </a>
              <a href="#home" className="hover:text-slate-300">
                Back to top
              </a>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
