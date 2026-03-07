"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import GitHubModal from "../github-modal/client";
import { Info, Github, GitFork } from "lucide-react";

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
        className="flex items-center mb-10"
      >
        <Image src="/images/leaf-l.png" alt="Laurel left" width={28} height={52} className="w-auto h-12 opacity-80" />
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            <Image
              src="https://avatars.githubusercontent.com/u/1024025?v=4"
              alt="Customer 1"
              width={36} height={36}
              priority
              className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm relative z-0"
            />
            <Image
              src="https://avatars.githubusercontent.com/u/499550?v=4"
              alt="Customer 2"
              width={36} height={36}
              priority
              className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm relative z-10"
            />
            <Image
              src="https://avatars.githubusercontent.com/u/11260973?v=4"
              alt="Customer 3"
              width={36} height={36}
              priority
              className="w-9 h-9 rounded-full border-2 border-white bg-purple-100 object-cover shadow-sm relative z-20"
            />
          </div>
          <span className="text-[17px] font-medium text-[#7a7a7a] tracking-tight">
            Trusted by 2k+ Customers
          </span>
        </div>
        <Image src="/images/leaf-r.png" alt="Laurel right" width={28} height={52} className="w-auto h-12 opacity-80" />
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
          <GitFork className="w-4 h-4 text-black" /> Contribute
        </button>
      </motion.div>
      {/* Logos Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-14 w-full max-w-5xl border-t border-gray-100"
      >
        <p className="text-center text-sm font-medium text-purple-600 mb-8">
          6010+ Profiles Generated in 8 Months from Around the Globe
        </p>
      </motion.div>


      {showGithubModal && (
        <GitHubModal onClose={() => setShowGithubModal(false)} />
      )}
    </section>
  );
}
