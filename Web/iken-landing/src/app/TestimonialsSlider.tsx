"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Youssef Abdelrahman",
    title: "Corporate Senior Project Manager, EFG Hermes",
    image: "/testimonials/youssef-abdelrahman.png",
    quote:
      "We have had the pleasure of utilizing the conference system developed by IKEN Technology for several years now, and it has been an absolute game-changer for our organization.",
    company: "EFG Hermes",
  },
  {
    name: "Mohammed Assem",
    title: "CTO & Co-founder, Balad",
    image: "/testimonials/mohammed-assem.png",
    quote:
      "IKEN Technology has truly exceeded our expectations. Their customized software solutions have streamlined our operations and provided a significant boost in productivity.",
    company: "Balad",
  },
  {
    name: "Waleed Kamel",
    title: "Managing Director, contactcars.com",
    image: "/testimonials/waleed-kamel.png",
    quote:
      "We have collaborated with IKEN for a decade as a third-party software provider, successfully executing numerous projects across various technology platforms and business domains.",
    company: "contactcars.com",
  },
];

export function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionRef = useRef<1 | -1>(1);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      directionRef.current = 1;
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
  }, []);

  // Auto-advance
  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const handleNext = () => {
    directionRef.current = 1;
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    startTimer();
  };

  const handlePrev = () => {
    directionRef.current = -1;
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    startTimer();
  };

  return (
    <div className="relative overflow-hidden bg-[#0a0f18] py-10 sm:py-14 flex items-center">
      
      {/* Background Graphic elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        
        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white mb-3">
              Trusted by <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Visionaries</span>
            </h2>
            <p className="text-slate-400 font-light text-lg sm:text-xl leading-relaxed">
              Discover how industry leaders leverage our solutions to transform their operations and accelerate growth across the region.
            </p>
          </div>
          
          {/* Top Navigation */}
          <div className="flex gap-4 items-center shrink-0">
            <button
              onClick={handlePrev}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:bg-white hover:text-[#0a0f18] hover:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous testimonial"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="text-slate-500 font-mono text-sm tracking-widest px-2 hidden sm:block">
              <motion.span 
                key={currentIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-block text-white"
              >
                0{currentIndex + 1}
              </motion.span> 
              <span className="mx-2 opacity-50">/</span> 
              0{TESTIMONIALS.length}
            </div>
            <button
              onClick={handleNext}
              className="group flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Next testimonial"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative min-h-[420px] lg:h-[400px] w-full rounded-3xl lg:rounded-[2.5rem] bg-[#111827]/60 backdrop-blur-xl border border-white/5 overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="absolute inset-0 flex flex-col lg:flex-row"
              initial={{ opacity: 0, x: directionRef.current * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: directionRef.current * -40, transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              
              {/* Left Side: Massive Photo */}
              <div className="relative w-full h-[45%] min-h-[180px] lg:h-full lg:w-[45%] xl:w-[40%] overflow-hidden bg-[#0a0f18] shrink-0">
                <motion.div
                  initial={{ scale: 1.08, x: directionRef.current * 20, filter: "brightness(0.75)" }}
                  animate={{ scale: 1, x: 0, filter: "brightness(1.05)" }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={TESTIMONIALS[currentIndex].image}
                    alt={TESTIMONIALS[currentIndex].name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain object-center"
                    priority
                  />
                  {/* Subtle vignette/fade over image */}
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#111827] via-[#111827]/40 to-transparent lg:from-[#111827] lg:via-[#111827]/10" />
                </motion.div>
              </div>

              {/* Right Side: Typography & Quote */}
              <div className="relative w-full lg:w-[55%] xl:w-[60%] flex flex-col justify-between p-6 sm:p-8 lg:p-10 z-20 h-[55%] lg:h-full">
                
                {/* Decorative Quote Mark */}
                <motion.div 
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                  className="absolute top-8 right-12 text-8xl font-serif text-white/5 leading-none select-none hidden sm:block"
                >
                  &rdquo;
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 flex flex-col justify-center max-w-3xl"
                >
                  <p className="text-lg sm:text-xl lg:text-2xl lg:leading-[1.5] font-light text-slate-200 mb-4 lg:mb-6 text-pretty">
                    &ldquo;{TESTIMONIALS[currentIndex].quote}&rdquo;
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.5, ease: "easeOut" }}
                  className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium tracking-wide text-white mb-1">
                      {TESTIMONIALS[currentIndex].name}
                    </h3>
                    <p className="text-blue-400 font-medium text-sm sm:text-base">
                      {TESTIMONIALS[currentIndex].title}
                    </p>
                  </div>
                </motion.div>

              </div>
              
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Bottom Pager Indicators */}
        <div className="flex gap-3 justify-center mt-5">
          {TESTIMONIALS.map((_, idx) => (
             <button
             key={idx}
             onClick={() => { setCurrentIndex(idx); startTimer(); }}
             className={`h-1.5 rounded-full transition-all duration-500 ${
               idx === currentIndex ? "w-10 bg-blue-500" : "w-4 bg-slate-700 hover:bg-slate-500"
             }`}
             aria-label={`Go to slide ${idx + 1}`}
           />
          ))}
        </div>

      </div>
    </div>
  );
}
