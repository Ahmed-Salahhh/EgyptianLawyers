"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const, delay } },
});

export default function ElAbdCaseStudy() {
  return (
    <div className="min-h-screen bg-[#080e1a] text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-cyan-600/6 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/8 bg-[#080e1a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="group flex items-center">
            <Image src="/iken-logo-new.png" alt="IKEN Technology" width={120} height={40}
              className="h-10 w-auto object-contain brightness-0 invert transition-opacity group-hover:opacity-80" />
          </Link>
          <Link href="/#projects" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Projects
          </Link>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden border-b border-white/6 py-20 lg:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(47,143,255,0.12),transparent)]" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div initial="hidden" animate="visible" variants={fadeUp(0)}>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Case Study · TaaS</span>
                </div>
                <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  IKEN × ELAbd
                </h1>
                <p className="mb-6 text-2xl font-semibold leading-snug text-slate-300">
                  A Strategic TaaS Partnership Driving Digital Growth
                </p>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-slate-400">
                  ELAbd — Egypt's most celebrated pastry brand — partnered with IKEN Technology as their dedicated development arm, establishing a full TaaS model to accelerate digital transformation.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact"
                    className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_0_28px_rgba(59,130,246,0.55)]">
                    Start a Partnership
                  </Link>
                  <a href="#results"
                    className="rounded-full border border-white/12 bg-white/[0.04] px-6 py-2.5 text-sm font-bold text-white transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
                    See Results ↓
                  </a>
                </div>
              </motion.div>

              {/* Logos + tags */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp(0.12)}
                className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-6 rounded-2xl border border-white/8 bg-white/[0.03] px-10 py-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#1a3a6b] p-3">
                    <Image src="/iken-logo-new.png" alt="IKEN" width={80} height={40} className="h-10 w-auto object-contain brightness-0 invert" />
                  </div>
                  <div className="text-2xl font-black text-slate-400">×</div>
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                    <Image src="/clients/br-elabd.png" alt="ELAbd" width={80} height={80} className="h-16 w-16 object-contain" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  {[["E-Commerce","Platform"],["TaaS","Model"],["Full-Stack","Delivery"]].map(([t,s]) => (
                    <div key={t} className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                      <p className="text-sm font-bold text-white">{t}</p>
                      <p className="text-xs text-slate-500">{s}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── IKEN'S ROLE ── */}
        <section className="border-b border-white/6 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)}
              className="mb-12">
              <div className="mb-2 inline-flex items-center gap-2 text-[#4ea7ff]">
                <span className="inline-flex h-3 w-3 rounded-[2px] bg-[#2f8fff]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Our Role</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">ELAbd's In-House Tech Arm</h2>
              <p className="mt-3 max-w-2xl text-slate-400">
                IKEN functions as ELAbd's in-house technical division — providing full-stack capabilities through a dedicated squad model without the overhead of building internal infrastructure.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Tech Expertise", desc: "Frontend, Backend, Mobile, DevOps, QA, and Product Management", icon: "⚡" },
                { title: "Business Integration", desc: "Deep collaboration with marketing, sales, and operations for aligned execution", icon: "🔗" },
                { title: "Fast Delivery", desc: "Continuous delivery with agile release cycles and rapid feature deployment", icon: "🚀" },
                { title: "Cost Efficiency", desc: "Full platform ownership from development to optimization — no full-time hiring costs", icon: "💰" },
              ].map((item, i) => (
                <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(i * 0.07)}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all hover:border-blue-400/25 hover:bg-white/[0.05]">
                  <div className="mb-3 text-2xl">{item.icon}</div>
                  <h3 className="mb-2 text-base font-bold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KEY INITIATIVES ── */}
        <section className="border-b border-white/6 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="mb-12">
              <div className="mb-2 inline-flex items-center gap-2 text-[#4ea7ff]">
                <span className="inline-flex h-3 w-3 rounded-[2px] bg-[#2f8fff]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Delivered</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Key Initiatives</h2>
            </motion.div>
            <div className="space-y-4">
              {[
                { n: "01", title: "E-Commerce Flow Optimization", desc: "Redesigned product catalog management and streamlined checkout experience, resulting in improved platform stability, faster page loads, and measurably higher customer satisfaction scores." },
                { n: "02", title: "Learning Management System", desc: "Custom-built LMS designed specifically for internal training programs, enabling HR and Sales teams to upskill employees efficiently and track professional development progress." },
                { n: "03", title: "Coupon & Discount Management", desc: "Sophisticated promotional campaign system enabling targeted offers, seasonal discounts, and loyalty rewards that drive conversion rates and customer retention." },
                { n: "04", title: "Multi-Department Collaboration", desc: "Cross-functional technology support extending beyond e-commerce to HR, Sales, Marketing, and Customer Success teams, creating unified digital operations." },
              ].map((item, i) => (
                <motion.div key={item.n} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(i * 0.06)}
                  className="flex gap-5 rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all hover:border-blue-400/20">
                  <span className="mt-0.5 text-2xl font-black text-blue-400/30 tabular-nums">{item.n}</span>
                  <div>
                    <h3 className="mb-1.5 text-base font-bold text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TAAS TEAM ── */}
        <section className="border-b border-white/6 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="mb-12">
              <div className="mb-2 inline-flex items-center gap-2 text-[#4ea7ff]">
                <span className="inline-flex h-3 w-3 rounded-[2px] bg-[#2f8fff]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Team Composition</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">TaaS Model in Action</h2>
              <p className="mt-3 max-w-2xl text-slate-400">
                Our dedicated team operates with the same priorities and urgency as internal staff — enabling flexible scaling based on project demands and business cycles.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { role: "Developers", desc: "Full-stack engineers building robust, scalable solutions" },
                { role: "UI/UX Designers", desc: "Creating intuitive, beautiful user experiences" },
                { role: "QA Engineers", desc: "Ensuring reliability through comprehensive testing" },
                { role: "Product Managers", desc: "Aligning technology with business objectives" },
                { role: "DevOps", desc: "Maintaining secure, performant infrastructure" },
              ].map((item, i) => (
                <motion.div key={item.role} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(i * 0.07)}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-blue-300">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.role}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── IMPACT & RESULTS ── */}
        <section id="results" className="border-b border-white/6 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="mb-12">
              <div className="mb-2 inline-flex items-center gap-2 text-[#4ea7ff]">
                <span className="inline-flex h-3 w-3 rounded-[2px] bg-[#2f8fff]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Outcomes</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Impact &amp; Results</h2>
              <p className="mt-3 max-w-2xl text-slate-400">
                Measurable business outcomes across multiple dimensions, demonstrating the tangible value of the TaaS model in accelerating digital transformation.
              </p>
            </motion.div>
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { v: "45%", l: "Faster Time-to-Market", sub: "New features deployed in half the time" },
                { v: "30%", l: "Order Volume Increase", sub: "Following UI/UX enhancements and platform optimization" },
                { v: "5+", l: "Departments Supported", sub: "E-Commerce, HR, Sales, Marketing, Operations" },
                { v: "200+", l: "Employees Trained", sub: "Internal staff upskilled through the custom LMS" },
              ].map((item, i) => (
                <motion.div key={item.l} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(i * 0.07)}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
                  <p className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-5xl font-black text-transparent">
                    {item.v}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.l}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Before/After bars */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-blue-400">Before vs. After Partnership</p>
              <div className="space-y-5">
                {[
                  { label: "Feature Delivery Speed", before: 50, after: 80 },
                  { label: "Platform Uptime", before: 65, after: 99 },
                  { label: "Customer Satisfaction", before: 72, after: 89 },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{bar.label}</span>
                      <span className="text-slate-500">{bar.before}% → <span className="text-blue-400 font-semibold">{bar.after}%</span></span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-white/8">
                      <div className="absolute left-0 top-0 h-full rounded-full bg-white/15" style={{ width: `${bar.before}%` }} />
                      <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-90" style={{ width: `${bar.after}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-white/15" />Before</span>
                <span className="flex items-center gap-1.5 text-blue-300"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />After Partnership</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TECH STACK ── */}
        <section className="border-b border-white/6 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)} className="mb-12">
              <div className="mb-2 inline-flex items-center gap-2 text-[#4ea7ff]">
                <span className="inline-flex h-3 w-3 rounded-[2px] bg-[#2f8fff]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Technology</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Inside the Tech Stack</h2>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Enterprise-Grade Technology Foundation</p>
            </motion.div>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { area: "Web Platform", tech: "React / Next.js / ASP.NET MVC", desc: "Server-side rendering for optimal performance and SEO" },
                { area: "Mobile Apps", tech: "React Native", desc: "Cross-platform native experience with single codebase" },
                { area: "Backend Services", tech: ".NET Core, Firebase", desc: "Scalable microservices with real-time capabilities" },
                { area: "Infrastructure", tech: "Azure DevOps, CI/CD", desc: "Automated deployment pipelines and monitoring" },
                { area: "Integrations", tech: "Payment Gateways, Delivery APIs, Coupon Engine", desc: "Seamless third-party service connectivity" },
              ].map((item, i) => (
                <motion.div key={item.area} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(i * 0.06)}
                  className="rounded-2xl border border-blue-400/20 bg-blue-500/8 p-5">
                  <p className="mb-0.5 text-sm font-bold text-blue-300">{item.area}</p>
                  <p className="mb-2 text-xs font-semibold text-white">{item.tech}</p>
                  <p className="text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[["Reliable","99.9% uptime with redundant systems"],["Scalable","Cloud-native architecture handles traffic spikes"],["Secure","Industry-standard encryption and compliance"]].map(([t,d]) => (
                <div key={t} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-4">
                  <span className="mt-0.5 text-blue-400">✓</span>
                  <div><p className="text-sm font-bold text-white">{t}</p><p className="text-xs text-slate-400">{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ── */}
        <section className="border-b border-white/6 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)}>
              <div className="mb-2 inline-flex items-center gap-2 text-[#4ea7ff]">
                <span className="inline-flex h-3 w-3 rounded-[2px] bg-[#2f8fff]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Voice from ELAbd</span>
              </div>
              <blockquote className="mt-6 text-2xl font-semibold leading-relaxed text-white sm:text-3xl">
                "Partnering with IKEN Technology gave us speed, flexibility, and top-tier e-commerce expertise.{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  They are not just a vendor — they are part of our team.
                </span>"
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1">
                  <Image src="/clients/br-elabd.png" alt="ELAbd" width={48} height={48} className="h-10 w-10 object-contain" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">ELAbd Leadership</p>
                  <p className="text-xs text-slate-400">ELAbd Patisserie, Egypt</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0)}>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Ready?</p>
              <h2 className="mb-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Let's Create Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Digital Future
                </span>
              </h2>
              <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-slate-400">
                The ELAbd–IKEN partnership demonstrates what's possible when innovative technology meets strategic collaboration. Whether you're beginning your digital transformation journey or looking to accelerate existing initiatives, the TaaS model offers a proven path to success.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_0_32px_rgba(59,130,246,0.6)]">
                  Get Started Today
                </Link>
                <Link href="/"
                  className="rounded-full border border-white/12 bg-white/[0.04] px-8 py-3.5 text-sm font-bold text-white transition-all hover:border-blue-400/30 hover:bg-white/[0.08]">
                  Learn More
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
                <a href="mailto:mustafa@iken.tech" className="transition hover:text-white">mustafa@iken.tech</a>
                <a href="https://www.iken.tech" className="transition hover:text-white">www.iken.tech</a>
                <a href="tel:+201050549994" className="transition hover:text-white">+20 10 5054 9994</a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} IKEN Technology. All rights reserved.
      </footer>
    </div>
  );
}
