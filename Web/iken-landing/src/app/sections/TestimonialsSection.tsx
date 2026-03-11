"use client";

import { motion } from "framer-motion";
import { TestimonialsSlider } from "../TestimonialsSlider";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function TestimonialsSection() {
  return (
    <motion.section
      id="testimonials"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fade}
      transition={{ duration: 0.45 }}
    >
      <TestimonialsSlider />
    </motion.section>
  );
}

