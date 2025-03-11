"use client";

import { motion } from "framer-motion";
import { BookOpen, Github, Linkedin, Plus } from "lucide-react";

interface IntegrationCardProps {
  type: "github" | "linkedin" | "medium" | "more";
  index: number;
}

export default function IntegrationCard({ type, index }: IntegrationCardProps) {
  const getIntegrationDetails = () => {
    switch (type) {
      case "github":
        return {
          icon: <Github size={32} className="text-black" />,
          title: "GitHub",
          description:
            "Showcase your repositories, contributions, and coding activity",
          color: "bg-[#B9FF66]",
          status: "Available",
        };
      case "linkedin":
        return {
          icon: <Linkedin size={32} className="text-[#0077B5]" />,
          title: "LinkedIn",
          description: "Display your professional experience and Education",
          color: "bg-blue-100",
          status: "New",
        };
      case "medium":
        return {
          icon: <BookOpen size={32} className="text-black" />,
          title: "Medium",
          description: "Share your technical articles and blog posts",
          color: "bg-orange-100",
          status: "New",
        };
      case "more":
        return {
          icon: <Plus size={32} className="text-gray-600" />,
          title: "More Coming Soon",
          description: "We're constantly adding new integrations",
          color: "bg-green-100",
          status: "Coming Soon",
        };
    }
  };

  const details = getIntegrationDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`${details.color} shadow-lg rounded-2xl p-6 transition-shadow hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">{details.icon}</div>
        <span
          className={`text-sm font-medium ${
            details.status === "New" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          {details.status}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{details.title}</h3>
      <p className="text-gray-600">{details.description}</p>
    </motion.div>
  );
}
