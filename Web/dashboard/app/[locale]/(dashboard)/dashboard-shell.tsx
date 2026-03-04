"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { clearAuthToken } from "@/lib/features/auth/token";
import { useAuthUser } from "@/lib/features/auth/use-auth-user";

const navItems = [
  { key: "dashboard", href: "/dashboard", badge: "DB" },
  { key: "lawyers", href: "/lawyers", badge: "LW" },
  { key: "cities", href: "/cities", badge: "CY" },
  { key: "courts", href: "/courts", badge: "CT" },
  { key: "posts", href: "/posts", badge: "PS" },
] as const;

type Props = {
  locale: string;
  children: React.ReactNode;
};

export default function DashboardShell({ locale, children }: Props) {
  const nav = useTranslations("Nav");
  const common = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const adminUser = useAuthUser(common("systemAdmin"));

  const avatarLetters = useMemo(() => {
    const words = adminUser.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "AD";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }, [adminUser.name]);

  const enLabel = common("languageEnglish");
  const arLabel = common("languageArabic");
  const activePath = useMemo(() => pathname ?? "", [pathname]);
  const localeAgnosticPath = useMemo(() => {
    const stripped = (pathname ?? "").replace(/^\/(en|ar)(?=\/|$)/, "");
    return stripped || "/dashboard";
  }, [pathname]);
  const gridCols = desktopCollapsed
    ? "md:grid-cols-[92px_1fr]"
    : "md:grid-cols-[272px_1fr]";

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const handleMenuToggle = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setDesktopCollapsed((prev) => !prev);
      return;
    }

    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    clearAuthToken();
    setProfileOpen(false);
    router.replace("/login");
  };

  const linkClass = (href: string) => {
    const isActive = activePath === `/${locale}${href}`;

    return [
      "group flex items-center rounded-xl border px-3 py-2.5 transition-colors",
      desktopCollapsed ? "justify-center" : "gap-2.5",
      isActive
        ? "border-[#2a67ff] bg-[#eaf1ff] text-[#1f4fd0]"
        : "border-transparent text-[#2b3c58] hover:border-[#d8e2f5] hover:bg-[#f1f5ff]",
    ].join(" ");
  };

  const renderHamburger = () => (
    <span className="inline-flex flex-col gap-1">
      <span className="h-0.5 w-4 rounded bg-current" />
      <span className="h-0.5 w-4 rounded bg-current" />
      <span className="h-0.5 w-4 rounded bg-current" />
    </span>
  );

  const renderSide = (mobile: boolean) => (
    <aside
      className={[
        "flex h-full flex-col border-r border-[#dbe4f5] bg-[#f7faff]",
        mobile ? "w-[84vw] max-w-[320px]" : "",
        desktopCollapsed ? "px-2 py-4" : "px-3 py-4",
      ].join(" ")}
    >
      <div className={`mb-5 ${desktopCollapsed && !mobile ? "text-center" : ""}`}>
        <div
          className={`mb-2 flex items-center ${
            desktopCollapsed && !mobile ? "justify-between" : "justify-between gap-2.5"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Image
              src="/lawyers-network-logo.svg"
              alt="Lawyers Network logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
            />
            <span
              className={`text-sm font-semibold text-[#1f2d45] ${
                desktopCollapsed && !mobile ? "hidden" : "inline"
              }`}
            >
              LNO
            </span>
          </div>
          {!mobile ? (
            <button
              type="button"
              onClick={() => setDesktopCollapsed((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d2ddf2] bg-white text-[#4a5f86] hover:bg-[#f2f6ff]"
              aria-label={
                desktopCollapsed
                  ? common("expandSidebar")
                  : common("collapseSidebar")
              }
            >
              {renderHamburger()}
            </button>
          ) : null}
        </div>
        <p
          className={`text-[11px] uppercase tracking-[0.2em] text-[#7284a5] ${
            desktopCollapsed && !mobile ? "hidden" : ""
          }`}
        >
          {common("admin")}
        </p>
        <p
          className={`mt-1 text-sm font-semibold text-[#1f2d45] ${
            desktopCollapsed && !mobile ? "hidden" : ""
          }`}
        >
          {common("appName")}
        </p>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            locale={locale}
            className={linkClass(item.href)}
            onClick={() => {
              if (mobile) setMobileOpen(false);
            }}
          >
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[#cfdaf0] bg-white px-1 text-[10px] font-semibold text-[#5a6f95]">
              {item.badge}
            </span>
            <span
              className={desktopCollapsed && !mobile ? "hidden" : "text-sm font-medium"}
            >
              {nav(item.key)}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#e7f1ff_0,transparent_35%),radial-gradient(circle_at_90%_0%,#defde9_0,transparent_30%),#eef3f9]">
      <div className="h-full w-full border border-[#d9e2f2] bg-[#fdfefe]">
        <div className={`grid h-full ${gridCols}`}>
          <div className="hidden md:block">{renderSide(false)}</div>

          <section className="flex min-w-0 flex-col">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5ebf7] bg-white px-4 py-3 md:px-6">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleMenuToggle}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d2ddf2] bg-white text-[#4a5f86] hover:bg-[#f2f6ff] md:hidden"
                  aria-label={common("openMenu")}
                >
                  {renderHamburger()}
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <div ref={profileRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2f3] bg-[#f7faff] px-2.5 py-1.5"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#245ce2] text-[11px] font-semibold text-white">
                      {avatarLetters}
                    </span>
                    <div className="leading-tight text-start">
                      <p className="text-sm font-semibold text-[#2a3a55]">{adminUser.name}</p>
                      <p className="text-[11px] text-[#7284a5]">{adminUser.role}</p>
                    </div>
                    <span className="text-xs text-[#7284a5]">v</span>
                  </button>

                  {profileOpen ? (
                    <div className="absolute end-0 top-[110%] z-20 w-48 rounded-xl border border-[#d8e2f3] bg-white p-1.5 shadow-[0_12px_28px_rgba(33,61,110,0.18)]">
                      <Link
                        href="/profile"
                        locale={locale}
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-[#2a3a55] hover:bg-[#f1f5ff]"
                      >
                        {common("profile")}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full rounded-lg px-3 py-2 text-start text-sm text-[#c83e5a] hover:bg-[#fff3f6]"
                      >
                        {common("logout")}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="inline-flex rounded-full border border-[#d2ddf2] bg-white p-1 text-sm shadow-sm">
                  <Link
                    href={localeAgnosticPath}
                    locale="en"
                    className={`rounded-full px-3 py-1 ${
                      locale === "en" ? "bg-[#245ce2] text-white" : "text-[#4e648c]"
                    }`}
                  >
                    {enLabel}
                  </Link>
                  <Link
                    href={localeAgnosticPath}
                    locale="ar"
                    className={`rounded-full px-3 py-1 ${
                      locale === "ar" ? "bg-[#245ce2] text-white" : "text-[#4e648c]"
                    }`}
                  >
                    {arLabel}
                  </Link>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
          </section>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/45"
            aria-label={common("closeMenu")}
          />
          <div className="absolute inset-y-0 start-0">{renderSide(true)}</div>
        </div>
      ) : null}
    </div>
  );
}


