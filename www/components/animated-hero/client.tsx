"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import GitHubModal from "../github-modal/client";

export default function AnimatedHeroClient() {
  const [showGithubModal, setShowGithubModal] = useState(false);

  useEffect(() => {
    // Check if URL has modal=true parameter
    const searchParams = new URLSearchParams(window.location.search);
    const shouldShowModal = searchParams.get("modal") === "true";

    if (shouldShowModal) {
      setShowGithubModal(true);
    }
  }, []);

  return (
    <section className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Left side - Text Content */}
      <motion.div
        className="flex-1 max-w-2xl"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="text-6xl md:text-7xl md:font-medium leading-tight mb-4">
          Effortless <span className="block">Portfolios for</span>
          <span className="inline-block bg-[#B9FF66] px-4 py-1 rounded-lg">
            Developers
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 mt-6">
          Your GitHub profile tells a story.
          <br />
          Let us help you narrate it
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowGithubModal(true)}
            className="bg-[#1A1A1A] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-black transition-colors"
          >
            Generate Your Portfolio
          </button>
        </div>
      </motion.div>

      {/* Right side - GitHub Illustration */}
      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="relative w-full max-w-lg mx-auto">
          <Image
            src="/images/hero.png"
            alt="GitHub Wrapped Illustration"
            width={600}
            height={600}
            className="w-full h-auto"
            priority
          />
        </div>
      </motion.div>

      {showGithubModal && (
        <GitHubModal onClose={() => setShowGithubModal(false)} />
      )}
    </section>
  );
}
