"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Book, GitFork, Menu, X } from "lucide-react";

export default function AnimatedNavClient() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled ? "bg-white/75 shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/www/public" className="flex items-center gap-2">
            <div className="relative w-24 h-8">
              <Image
                src="/images/logo-full.png"
                alt="DevB Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="https://docs.devb.io"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-black/5"
            >
              <Book size={18} />
              <span>Docs</span>
            </Link>
            <div className="flex items-center">
              <iframe
                src="https://ghbtns.com/github-btn.html?user=sunithvs&repo=devb.io&type=star&count=true"
                frameBorder="0"
                scrolling="0"
                width="100"
                height="20"
                title="GitHub"
                className="transform translate-y-[1px]"
              />
            </div>
            <a
              href="https://github.com/sunithvs/devb.io/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <GitFork size={18} />
              <span>Contribute</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-black transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 space-y-2">
            <Link
              href="/docs"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-black/5"
            >
              <Book size={18} />
              <span>Documentation</span>
            </Link>
            <div className="px-4 py-2">
              <iframe
                src="https://ghbtns.com/github-btn.html?user=sunithvs&repo=devb.io&type=star&count=true"
                frameBorder="0"
                scrolling="0"
                width="100"
                height="20"
                title="GitHub"
              />
            </div>
            <a
              href="https://github.com/sunithvs/devb.io/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors w-fit"
            >
              <GitFork size={18} />
              <span>Contribute</span>
            </a>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
