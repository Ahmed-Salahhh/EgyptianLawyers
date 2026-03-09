"use client";

import { ContactSection } from "./sections/ContactSection";
import { ClientsSection } from "./sections/ClientsSection";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/HeroSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { ServicesSection } from "./sections/ServicesSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020818] text-[#15233b]">
      <Header />

      <main id="home" className="bg-[#f5f8ff]">
        <HeroSection />

        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <ServicesSection />
          <ProjectsSection />
          <TestimonialsSection />
          <ClientsSection />
        </div>

        <ContactSection />
      </main>
    </div>
  );
}
