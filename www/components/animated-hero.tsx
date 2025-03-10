"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import GitHubModal from "./github-modal";

export default function AnimatedHero() {
  const [showGithubModal, setShowGithubModal] = useState(false);

  return (
    <section className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-transparent to-transparent -z-10 rounded-3xl opacity-50" />

      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute -left-8 -top-8 w-20 h-20 bg-[#B9FF66]/20 rounded-full blur-xl"
        />
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Automated Developer Portfolios Powered by GitHub & AI
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl mb-8 text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Transform your GitHub profile into a polished portfolio instantly.
          AI-powered bios, automatic updates, and real-time activity tracking.
        </motion.p>
        <motion.div
          className="flex gap-4 items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button
            onClick={() => setShowGithubModal(true)}
            className="bg-[#B9FF66] text-black px-8 py-3 rounded-xl font-medium text-lg hover:bg-opacity-90 transition-all border-2 border-black border-b-[4px] hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Get Started</span>
            <motion.div
              className="absolute inset-0 bg-lime-300 -z-0"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ type: "tween", duration: 0.3 }}
            />
          </motion.button>
          <motion.a
            href="#how-it-works"
            className="text-gray-600 hover:text-black transition-colors flex items-center gap-2 group"
            whileHover={{ x: 5 }}
          >
            Learn More
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.div
          className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#B9FF66]/20 rounded-full blur-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        />
        <div className="relative w-full aspect-square">
          <Image
            src="/images/hero.png"
            alt="Hero"
            fill
            className="object-contain hover:scale-105 transition-transform duration-300"
            priority
          />
        </div>
      </motion.div>

      <GitHubModal isOpen={showGithubModal} onOpenChange={setShowGithubModal} />
    </section>
  );
}
