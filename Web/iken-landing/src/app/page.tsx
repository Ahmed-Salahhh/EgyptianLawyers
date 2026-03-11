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
    <div className="min-h-screen bg-[#080e1a] text-[#15233b]">
      <Header />

      <main id="home" className="bg-[#080e1a]">
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
