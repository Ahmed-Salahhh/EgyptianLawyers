"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number; // Not used in scrub animations, keeping for prop compatibility
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  className?: string;
  duration?: number; // Not used in scrub animations
}

export default function FadeIn({
  children,
  direction = "up",
  distance = 40,
  className = "",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Track the scroll progress of THIS specific element within the viewport.
  // "start 90%" means the animation starts when the top of the element hits 90% of the viewport height.
  // "start 60%" means the animation finishes when the top of the element hits 60% of the viewport height.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "start 60%"], // Tweak these to change when the fade happens
  });

  // Map the scroll progress (0 to 1) directly to opacity (0 to 1)
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Map the scroll progress to the physical movement
  const getTransform = () => {
    switch (direction) {
      case "up":
        return useTransform(scrollYProgress, [0, 1], [distance, 0]);
      case "down":
        return useTransform(scrollYProgress, [0, 1], [-distance, 0]);
      case "left":
        return useTransform(scrollYProgress, [0, 1], [distance, 0]);
      case "right":
        return useTransform(scrollYProgress, [0, 1], [-distance, 0]);
      default:
        return useTransform(scrollYProgress, [0, 1], [distance, 0]);
    }
  };

  const transformValue = getTransform();

  // Determine which axis to animate based on direction
  const style = {
    opacity,
    ...(direction === "up" || direction === "down" ? { y: transformValue } : { x: transformValue }),
  };

  return (
    <motion.div ref={ref} style={style} className={className}>
      {children}
    </motion.div>
  );
}
