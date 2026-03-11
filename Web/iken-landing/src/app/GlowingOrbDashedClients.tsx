"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";

const INITIAL_BRANDS = [
  { name: "Contactcars", logo: "/clients/br-contactcars.jpg" }, // Central Hub initially
  { name: "EFG Hermes", logo: "/clients/br-efg.jpg" },
  { name: "ValU", logo: "/clients/br-valu.jpg" },
  { name: "El Abd", logo: "/clients/br-elabd.png" },
  { name: "Joint Scope", logo: "/clients/br-jointscope.jpg" },
  { name: "Balad", logo: "/clients/br-balad.jpg" },
  { name: "Furn", logo: "/clients/br-furn.jpg" },
  { name: "Elite Solutions", logo: "/clients/br-elitessolutions.jpg" },
  { name: "Moqa walat", logo: "/clients/br-moqawalat.jpg" },
  { name: "Alaqaar", logo: "/clients/br-alaqaar.jpg" },
  { name: "Jamjoom Pharma", logo: "/clients/br-jamjoom.jpg" },
];

const LAYOUT_CONFIG = {
  // The "Soul" of the constellation - carefully balanced zones for 10 satellites
  // Angles in degrees, Radii in percentage of container half-width/height
  CONSTELLATION_TEMPLATE: [
    { angle: 270, rx: 44, ry: 38 }, // Summit
    { angle: 230, rx: 32, ry: 28 }, // Inner Left (El Abd - Moved Up & Out)
    { angle: 310, rx: 32, ry: 28 }, // Inner Right (Moved Up & Out)
    { angle: 195, rx: 42, ry: 36 }, // Mid Left
    { angle: 345, rx: 42, ry: 36 }, // Mid Right
    { angle: 165, rx: 50, ry: 44 }, // Low Wing Left
    { angle: 15,  rx: 50, ry: 44 }, // Low Wing Right
    { angle: 125, rx: 44, ry: 40 }, // Gravity Left
    { angle: 55,  rx: 44, ry: 40 }, // Gravity Right
    { angle: 90,  rx: 38, ry: 34 }, // Gravity Center
  ],
  // Visual tweaks
  ANIMATION: { stiffness: 200, damping: 20 },
  PULSE_SCALE: 1.3,
};

function generateConstellationNetwork(totalBrands: number) {
  const positions = [{ x: 50, y: 50 }]; // Hub
  const satellites = totalBrands - 1;
  const connections: { from: number; to: number; width: number; dash: string }[] = [];

  // Hub and Spoke Connections Only
  for (let i = 1; i <= satellites; i++) {
    connections.push({ from: 0, to: i, width: 2, dash: "6 6" });
  }

  if (satellites <= 0) return { positions, connections };

  // Map brands to the constellation template
  for (let i = 0; i < satellites; i++) {
    // If we have more brands than template slots, fallback to a basic ring for extras
    const template = LAYOUT_CONFIG.CONSTELLATION_TEMPLATE[i];
    
    if (template) {
      const rad = (template.angle * Math.PI) / 180;
      positions.push({
        x: 50 + template.rx * Math.cos(rad),
        y: 50 + template.ry * Math.sin(rad),
      });
    } else {
      // Fallback ring for nodes 11+ (extremely rare)
      const angle = (i * 2 * Math.PI) / satellites;
      positions.push({
        x: 50 + 45 * Math.cos(angle),
        y: 50 + 40 * Math.sin(angle),
      });
    }
  }
  
  return { positions, connections };
}

export function GlowingOrbDashedClients() {
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  
  // Clean mathematical generation executing only once on mount
  const networkData = useMemo(() => generateConstellationNetwork(INITIAL_BRANDS.length), []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSwap = (clickedIndex: number) => {
    if (clickedIndex === 0) return; // Already in center

    const newBrands = [...brands];
    
    // Swap the data at index 0 and clickedIndex
    const temp = newBrands[0];
    newBrands[0] = newBrands[clickedIndex];
    newBrands[clickedIndex] = temp;
    
    setBrands(newBrands);
  };

  if (!mounted) {
    return <div className="relative w-full h-[600px] md:h-[700px] bg-transparent" />;
  }

  return (
    <div className="relative w-full h-[600px] md:h-[700px] bg-transparent overflow-hidden">
      
      {/* Shared Coordinate Space for Lines and Orbs */}
      <div className="relative w-full h-full max-w-[1200px] mx-auto">
        
        {/* SVG Lines - rendered client-side only to avoid hydration mismatch */}
        <div className="absolute inset-0 pointer-events-none">
          {mounted && (
            <svg className="w-full h-full opacity-30" preserveAspectRatio="none">
              {networkData.connections.map((conn, idx) => {
                const p1 = networkData.positions[conn.from];
                const p2 = networkData.positions[conn.to];
                return (
                  <line
                    key={`line-${idx}`}
                    x1={`${p1.x}%`}
                    y1={`${p1.y}%`}
                    x2={`${p2.x}%`}
                    y2={`${p2.y}%`}
                    stroke="var(--color-brand-cyan)"
                    strokeWidth={conn.width}
                    strokeDasharray={conn.dash}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* The Orbs */}
        {brands.map((client, i) => {
          const isCenter = i === 0;
          const pos = networkData.positions[i];
          
          return (
            <motion.div
              onClick={() => handleSwap(i)}
              key={`orb-${client.name}`}
              className={`absolute group ${isCenter ? 'z-20 cursor-default' : 'z-10 cursor-pointer'}`}
              style={{ transform: "translate(-50%, -50%)" }}
              initial={false}
              animate={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`,
              }}
              transition={{ type: "spring", ...LAYOUT_CONFIG.ANIMATION }}
            >
              {/* Pulsing ring background */}
              <motion.div
                className={`absolute inset-0 bg-[var(--color-brand-cyan)] rounded-full ${isCenter ? 'opacity-40' : 'opacity-20'}`}
                animate={{ scale: [1, LAYOUT_CONFIG.PULSE_SCALE, 1], opacity: [isCenter ? 0.4 : 0.2, 0, isCenter ? 0.4 : 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* The actual Orb containing the logo */}
              <div className={`relative ${isCenter ? 'w-40 h-40 md:w-56 md:h-56 shadow-[0_0_80px_var(--color-brand-cyan-glow)]' : 'w-20 h-20 md:w-24 md:h-24 shadow-[0_0_30px_var(--color-brand-cyan-glow)]'} bg-[var(--color-bg-card)] backdrop-blur-md rounded-full border border-[var(--color-brand-cyan)]/30 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-[var(--color-bg-glass-strong)] hover:border-[var(--color-brand-cyan)] hover:shadow-[0_0_50px_var(--color-brand-cyan-glow)] z-10 ${!isCenter && 'hover:scale-110'}`}>
                <div className="w-[85%] h-[85%] bg-white rounded-full flex items-center justify-center p-2 md:p-3 shadow-inner">
                  <Image 
                    src={client.logo} 
                    alt={client.name} 
                    width={isCenter ? 180 : 80} 
                    height={isCenter ? 90 : 40} 
                    className={`max-w-full object-contain mix-blend-multiply transition-opacity duration-300 ${isCenter ? 'max-h-24 opacity-95 group-hover:opacity-100' : 'max-h-12 opacity-70 group-hover:opacity-100'}`} 
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
