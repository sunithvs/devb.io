"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import GitHubModal from "../github-modal/client";
import { Info, Github } from "lucide-react";

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
    <section className="w-full flex flex-col items-center justify-center pb-16 md:pb-24">
      {/* Trusted badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm mb-10"
      >
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px]">🧑‍💻</div>
          <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[10px]">👩‍💻</div>
          <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px]">👨‍💻</div>
        </div>
        <span className="text-sm font-medium text-gray-600">
          Trusted by 6k+ Developers
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-[76px] font-semibold text-[#111] leading-[1.1] tracking-tight text-center max-w-5xl"
      >
        Effortless <span className="inline-flex relative -top-1 md:-top-2 items-center justify-center bg-indigo-50 w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-1 md:mx-3 shadow-inner text-2xl md:text-4xl translate-y-2">👨‍💻</span> Portfolios <br className="hidden md:block" />
        for <span className="inline-flex relative -top-1 md:-top-2 items-center justify-center bg-rose-50 w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-1 md:mx-3 shadow-inner text-2xl md:text-4xl translate-y-2">🚀</span> Developers <span className="inline-flex relative -top-1 md:-top-2 items-center justify-center bg-amber-50 w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-1 md:mx-3 shadow-inner text-2xl md:text-4xl translate-y-2">✨</span>
      </motion.h1>

      {/* Subhead */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-500 mt-8 max-w-2xl text-center px-4"
      >
        Automatic portfolio generation powered by your GitHub profile.
        <br className="hidden md:block" />
        Zero maintenance required. Setup once, let it narrate your story.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 mt-10"
      >
        <button
          onClick={() => setShowGithubModal(true)}
          className="bg-black text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Github className="w-5 h-5" /> Generate Portfolio
        </button>
        <button className="bg-white border text-gray-700 border-gray-200 px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Info className="w-4 h-4 text-gray-400" /> Learn more
        </button>
      </motion.div>

      {/* Logos Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-24 w-full max-w-5xl border-t border-gray-100 pt-10"
      >
        <p className="text-center text-sm font-medium text-purple-600 mb-8">
          DevB is utilized by over 6,010 developers worldwide.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale filter">
          {/* Faking some logos with text and simple flex layouts */}
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-current" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
            tropic
          </div>
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="text-2xl font-black">N</div> Netcore
          </div>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <span className="font-bold text-xl">A</span> ANNEX CLOUD
          </div>
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex flex-wrap w-5 h-5 gap-[2px]">
               <div className="w-2 h-2 bg-current rounded-sm"></div>
               <div className="w-2 h-2 bg-current rounded-sm"></div>
               <div className="w-2 h-2 bg-current rounded-sm"></div>
               <div className="w-2 h-2 bg-current rounded-sm"></div>
            </div>
            cansaas
          </div>
          <div className="flex items-center gap-2 font-bold text-xl italic tracking-tighter">
            ramp
          </div>
          <div className="flex items-center gap-2 font-bold text-lg uppercase tracking-widest">
            ORACLE
          </div>
        </div>
      </motion.div>

      {showGithubModal && (
        <GitHubModal onClose={() => setShowGithubModal(false)} />
      )}
    </section>
  );
}
