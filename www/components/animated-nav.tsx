"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AnimatedNav() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed w-full bg-white/70 backdrop-blur-md z-50 py-4 shadow-sm border-b border-gray-100"
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <motion.div
          className="flex gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Image
            width={100}
            height={30}
            src="/images/logo-full.png"
            alt="devb.io"
            className="hover:brightness-110 transition-all"
          />
        </motion.div>
        <div className="hidden lg:flex items-center md:gap-14">
          {["Home", "How It Works", "Services", "People"].map((item, index) => (
            <motion.a
              key={item}
              href={
                item === "Home"
                  ? "#"
                  : `#${item.toLowerCase().replace(/\s+/g, "-")}`
              }
              className="hover:text-lime-500 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-lime-500"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          ))}
        </div>
        <motion.div
          className="flex gap-3 justify-end items-end rounded-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <iframe
            src="https://ghbtns.com/github-btn.html?user=sunithvs&repo=devb.io&type=star&count=true&size=large"
            frameBorder="0"
            scrolling="0"
            width="170"
            height="30"
            title="GitHub"
          />
        </motion.div>
      </div>
    </motion.nav>
  );
}
