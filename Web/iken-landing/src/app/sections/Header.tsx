"use client";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Models", href: "#models" },
  { label: "Services", href: "#services" },
  { label: "Industries", href: "#industries" },
  { label: "Projects", href: "#projects" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Clients", href: "#clients" },
  { label: "Contact", href: "#contact" },
];

import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-light)] bg-[var(--color-bg-glass)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <a href="#home" className="group flex items-center">
          <Image
            src="/iken-logo-new.png"
            alt="IKEN Technology"
            width={120}
            height={40}
            className={`h-10 w-auto object-contain transition-all group-hover:opacity-80 ${
              mounted && theme === "dark" ? "brightness-0 invert" : ""
            }`}
          />
        </a>

        {/* Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="relative text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[var(--color-brand-blue)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA & Toggle */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/contact"
            className="rounded-full bg-gradient-to-r from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)] px-6 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_0_14px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_0_22px_rgba(59,130,246,0.5)]"
          >
            Start a Project
          </Link>
        </div>

      </div>
    </header>
  );
}
