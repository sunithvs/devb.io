"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Github, Menu, X } from "lucide-react";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-2xl font-bold"
          >
            <Github size={32} className="text-black" />
            <span>DevB</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/docs"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-black transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/github"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Github size={20} />
              <span>Sign In</span>
            </Link>
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
          animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 space-y-4">
            <Link
              href="/docs"
              className="block text-gray-600 hover:text-black transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/about"
              className="block text-gray-600 hover:text-black transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-gray-600 hover:text-black transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/github"
              className="block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 w-fit"
            >
              <Github size={20} />
              <span>Sign In</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
