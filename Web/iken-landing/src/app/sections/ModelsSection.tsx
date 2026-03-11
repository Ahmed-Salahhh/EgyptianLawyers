"use client";

import { motion } from "framer-motion";

const models = [
  {
    num: "MODEL 01",
    title: "Team as a Service",
    desc: "Access skilled professionals across various tech disciplines, scaling your projects without the long‑term commitment of full‑time hires.",
    accentClass: "bg-[#2f8fff]",
    labelClass: "text-[#4ea7ff]",
    features: [
      { label: "Dedicated Teams", desc: "Skilled developers for your specific needs" },
      { label: "Agile Methodology", desc: "Efficient, adaptive development processes" },
      { label: "Quality Solutions", desc: "On-time, within-budget delivery" },
    ],
    benefits: [
      { label: "Scalability", desc: "Easily scale your team to meet fluctuating project demands." },
      { label: "Flexibility", desc: "Adapt quickly to changing business needs and market trends." },
      { label: "Cost-Effective", desc: "Pay only for services needed without overhead costs." },
      { label: "Reduced Time to Market", desc: "Accelerate development with our efficient processes." },
    ],
  },
  {
    num: "MODEL 02",
    title: "Development Partnership",
    desc: "A dedicated software development team embedded within your business, aligned with your goals, and committed to long‑term growth.",
    accentClass: "bg-[#2f8fff]",
    labelClass: "text-[#4ea7ff]",
    features: [
      { label: "Strategic Partnership", desc: "Establish a dedicated dev team embedded within your business." },
      { label: "Innovative Solutions", desc: "Develop new products, enhance existing systems, provide maintenance." },
      { label: "Measurable Success", desc: "Reduce time to market, cut costs, improve customer satisfaction." },
    ],
    benefits: [
      { label: "Technological Expertise", desc: "Access cutting-edge technology skills without extensive recruitment." },
      { label: "Dedicated Resources", desc: "A team fully committed to your business goals with deep understanding." },
      { label: "Increased Productivity", desc: "Streamline development processes and enhance output quality." },
      { label: "Long-term Partnership", desc: "Build a sustainable relationship focused on continuous improvement." },
    ],
  },
];

export function ModelsSection() {
  return (
    <section id="models" className="relative overflow-hidden bg-[#080e1a] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-cyan-600/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45 }}
          className="mb-12 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 text-[#4ea7ff]">
            <span className="inline-flex h-3.5 w-3.5 rounded-[3px] bg-[#2f8fff]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">How We Work</span>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Our{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Engagement Models
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
            Choose the model that fits your business — a flexible team on demand, or a long‑term development partnership embedded in your operations.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {models.map((model, mi) => (
            <motion.div
              key={model.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: mi * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-8"
            >
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">
                {/* Label + title */}
                <div className={`mb-1 inline-flex items-center gap-2 ${model.labelClass}`}>
                  <span className={`inline-flex h-3 w-3 rounded-[2px] ${model.accentClass}`} />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">{model.num}</span>
                </div>
                <h3 className="mb-1 text-2xl font-bold text-white">{model.title}</h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-400">{model.desc}</p>

                {/* Features */}
                <div className="mb-6 space-y-2">
                  {model.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.025] p-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">{f.label}</p>
                        <p className="text-xs text-slate-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="mb-5 border-t border-white/8" />
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">Benefits</p>

                {/* Benefits */}
                <div className="space-y-4">
                  {model.benefits.map((b, i) => (
                    <div key={b.label} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-[10px] font-bold text-blue-300">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{b.label}</p>
                        <p className="text-xs leading-relaxed text-slate-400">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
