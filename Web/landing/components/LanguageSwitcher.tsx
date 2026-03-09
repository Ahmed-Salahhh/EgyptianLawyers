"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface LanguageSwitcherProps {
  locale: string;
  localeEnLabel: string;
  localeArLabel: string;
}

export function LanguageSwitcher({
  locale,
  localeEnLabel,
  localeArLabel,
}: LanguageSwitcherProps) {
  return (
    <div className="relative flex items-center p-1 bg-background-main/30 backdrop-blur-xl rounded-full border border-text-main/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
      <Link
        className={`relative z-10 px-7 py-2.5 rounded-full text-[11px] md:text-[12px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${
          locale === "en" ? "text-white! drop-shadow-sm" : "text-text-muted hover:text-text-main"
        }`}
        href="/"
        locale="en"
      >
        {locale === "en" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg shadow-primary/30"
            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
          />
        )}
        {localeEnLabel}
      </Link>
      <Link
        className={`relative z-10 px-7 py-2.5 rounded-full text-[11px] md:text-[12px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${
          locale === "ar" ? "text-white! drop-shadow-sm" : "text-text-muted hover:text-text-main"
        }`}
        href="/"
        locale="ar"
      >
        {locale === "ar" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg shadow-primary/30"
            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
          />
        )}
        {localeArLabel}
      </Link>
    </div>
  );
}
