"use client";

import { motion } from "framer-motion";
import { Github, RefreshCw, Share2, Search, Code } from "lucide-react";

const iconMap = {
  Github,
  RefreshCw,
  Share2,
  Search,
  Code
};

interface HowItWorksCardProps {
  iconName: keyof typeof iconMap;
  title: string;
  description: string;
  index: number;
}

export default function HowItWorksCardClient({ iconName, title, description, index }: HowItWorksCardProps) {
  const Icon = iconMap[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="mb-6">
        <div className="w-12 h-12 bg-[#B9FF66] rounded-xl flex items-center justify-center">
          <Icon size={24} className="text-black" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
