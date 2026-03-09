"use client";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#home" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
            I
          </div>
          <div>
            <div className="font-bold text-white">IKEN</div>
            <div className="text-xs text-slate-400">Technology</div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#services" className="text-slate-400 transition-colors hover:text-white">
            Services
          </a>
          <a href="#projects" className="text-slate-400 transition-colors hover:text-white">
            Projects
          </a>
          <a href="#clients" className="text-slate-400 transition-colors hover:text-white">
            Clients
          </a>
          <a href="#contact" className="text-slate-400 transition-colors hover:text-white">
            Contact
          </a>
        </nav>

        <a
          href="#contact"
          className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all hover:from-cyan-600 hover:to-blue-600"
        >
          Start a Project
        </a>
      </div>
    </header>
  );
}

