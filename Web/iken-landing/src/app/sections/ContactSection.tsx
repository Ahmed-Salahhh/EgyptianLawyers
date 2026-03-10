"use client";

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(22,199,255,0.2),transparent_35%),radial-gradient(circle_at_90%_18%,rgba(168,85,247,0.2),transparent_45%),#020617]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-6 pt-16">
        <div className="mx-auto max-w-4xl py-8 text-center">
          <h2 className="text-5xl font-black leading-[0.95] sm:text-6xl">
            Ready to{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Transform
            </span>
            <br />
            Your Product?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Let&apos;s start a conversation about your next big project.
          </p>
        </div>

        <div className="mt-8 grid gap-8 border-t border-slate-800 py-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
                I
              </div>
              <div>
                <p className="font-bold">IKEN</p>
                <p className="text-xs text-slate-400">Technology</p>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate-400">
              We build digital products that move from idea to measurable business outcomes.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-400">Quick Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
              <a href="#services" className="transition hover:text-white">
                Services
              </a>
              <a href="#projects" className="transition hover:text-white">
                Projects
              </a>
              <a href="#clients" className="transition hover:text-white">
                Clients
              </a>
              <a href="#contact" className="transition hover:text-white">
                Contact
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-400">Contact Channels</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>
                <a href="mailto:contact@iken.tech" className="hover:text-white">
                  contact@iken.tech
                </a>
              </p>
              <p>
                <a href="tel:+201050500017" className="hover:text-white">
                  (+20) 105 0500017
                </a>
              </p>
              <p className="pt-2 text-slate-400">22x, Tharwat Abu El Gouk Street, Maadi, Cairo, Egypt</p>
              <p className="text-slate-400">Sunday - Thursday, 8:00 AM - 7:00 PM</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-400">Social</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white">
                  LinkedIn
                </a>
              </p>
              <p>
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-white">
                  Facebook
                </a>
              </p>
              <p>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">
                  Instagram
                </a>
              </p>
              <p>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white">
                  X (Twitter)
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} IKEN Technology. All rights reserved.
      </div>
    </section>
  );
}

