"use client";

import { AboutSection } from "./sections/AboutSection";
import { ContactSection } from "./sections/ContactSection";
import { ClientsSection } from "./sections/ClientsSection";
import { Header } from "./sections/Header";
import { HeroSection } from "./sections/HeroSection";
import { IndustriesSection } from "./sections/IndustriesSection";
import { ModelsSection } from "./sections/ModelsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { ServicesSection } from "./sections/ServicesSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <Header />

      <main id="home" className="bg-[var(--color-bg-main)]">
        <HeroSection />

        <AboutSection />

        <ServicesSection />

        <ModelsSection />

        <IndustriesSection />

        <ProjectsSection />

        <TestimonialsSection />

        <ClientsSection />

        <ContactSection />
      </main>
    </div>
  );
}
