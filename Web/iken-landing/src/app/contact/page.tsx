"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const contactInfo = [
  {
    label: "Address",
    value: "22x, Tharwat Abu El Gouk St, New Maadi, Cairo, Egypt",
    href: "https://maps.google.com/?q=Maadi,Cairo,Egypt",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "contact@iken.tech",
    href: "mailto:contact@iken.tech",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+20 10 5054 9994",
    href: "tel:+201050549994",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Working Hours",
    value: "Sun – Thu: 8:00 AM – 7:00 PM (CAT)",
    href: null,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const services = [
  "Product Discovery",
  "Custom Software",
  "Web & Mobile Apps",
  "E-Commerce Solutions",
  "Maintenance & Support",
  "Team as a Service",
  "Development Partnership",
  "Other",
];

const socials = [
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080e1a] text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-blue-600/8 blur-[130px]" />
        <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-cyan-600/6 blur-[130px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/8 bg-[#080e1a]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="group flex items-center">
            <Image
              src="/iken-logo-new.png"
              alt="IKEN Technology"
              width={120}
              height={40}
              className="h-10 w-auto object-contain brightness-0 invert transition-opacity group-hover:opacity-80"
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        {/* Page title */}
        <div className="mb-14 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 text-[#4ea7ff]">
            <span className="inline-flex h-3.5 w-3.5 rounded-[3px] bg-[#2f8fff]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Get In Touch</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Let&apos;s Build{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Something Great
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Ready to start your next project? Fill in the form and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          {/* Left — Contact info */}
          <div className="space-y-4">
            {contactInfo.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:border-blue-400/30 hover:bg-white/[0.06]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300 transition-colors group-hover:bg-blue-500/20">
                    {item.icon}
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white">{item.value}</p>
                  </div>
                </a>
              ) : (
                <div
                  key={item.label}
                  className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                    {item.icon}
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="text-sm font-medium text-slate-200">{item.value}</p>
                  </div>
                </div>
              )
            )}

            {/* Social */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Follow Us</p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-400 transition-all hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">Message Sent!</h2>
                <p className="max-w-xs text-sm text-slate-400">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-300 transition hover:border-blue-400/30 hover:text-white"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Full Name <span className="text-blue-400">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ahmed Mohamed"
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-400/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Email <span className="text-blue-400">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-400/20"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="Your Company"
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-400/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+20 10 0000 0000"
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Service Interested In
                  </label>
                  <select
                    className="w-full rounded-xl border border-white/8 bg-[#080e1a] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20"
                  >
                    <option value="">Select a service…</option>
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Message <span className="text-blue-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about your project — goals, timeline, budget…"
                    className="w-full resize-none rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-400/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_0_28px_rgba(59,130,246,0.55)] disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} IKEN Technology. All rights reserved.
      </footer>
    </div>
  );
}
