"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

interface AnimatedStatsProps {
  value: number;
  subtitle: string;
}

export default function AnimatedStats({ value, subtitle }: AnimatedStatsProps) {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      // Animate the counter
      let start = 0;
      const end = value;
      const duration = 2000; // 2 seconds
      const increment = end / (duration / 16); // Update every 16ms (60fps)

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      // Animate the text
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" },
      });

      return () => clearInterval(timer);
    }
  }, [isInView, value, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="text-center"
    >
      <motion.div className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
        {count}
      </motion.div>
      <motion.p className="text-xl md:text-2xl text-gray-600">
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
