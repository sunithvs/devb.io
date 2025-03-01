'use client';

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedPage({ children, className }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children, className }: AnimatedProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedSection({ children, className }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedText({ children, className }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        type: "spring",
        damping: 20,
        stiffness: 100
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedTitle({ children, className }: AnimatedProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay: 0.1
      }}
      className={className}
    >
      {children}
    </motion.h2>
  );
}

export function AnimatedListItem({ children, className }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        type: "spring",
        damping: 20,
        stiffness: 100,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
