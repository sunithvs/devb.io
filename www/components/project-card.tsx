"use client";

import React from "react";
import Link from "next/link";
import { Project } from "@/types/types";
import { ExternalLink, GitFork, Github, Star } from "lucide-react";
import Badge from "@/components/Badge";
import { motion } from "framer-motion";

const SEPARATOR_COLORS = [
  "bg-[#E63946]", // Deep Red
  "bg-[#2A9D8F]", // Dark Teal
  "bg-[#1E88E5]", // Rich Blue
  "bg-[#2D6A4F]", // Forest Green
  "bg-[#FF9F1C]", // Deep Orange
  "bg-[#D90429]", // Crimson
  "bg-[#5E60CE]", // Deep Purple
  "bg-[#023E8A]", // Navy Blue
  "bg-[#F94144]", // Bright Red
  "bg-[#2B9348]", // Deep Green
];

const ProjectCard = ({
  name,
  description,
  language,
  stars,
  url,
  homepage,
  forks,
}: Project) => {
  const isGithubPreview = !homepage;
  const previewUrl = isGithubPreview
    ? `https://opengraph.githubassets.com/317f0ed00d6d6d4a22f24b956b3988bc254e791fcfe1955acef5add1764cfb42/${encodeURIComponent(url.split("/")[3])}/${encodeURIComponent(url.split("/")[4])}`
    : `https://api.microlink.io?url=${encodeURIComponent(homepage)}&screenshot=true&embed=screenshot.url`;

  const getColorIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % SEPARATOR_COLORS.length;
  };

  const separatorColor = SEPARATOR_COLORS[getColorIndex(name)];

  return (
    <motion.div
      className="bg-white rounded-xl border-1 border-black border-b-4 w-full h-full flex flex-col"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="relative mb-1">
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={previewUrl}
          alt={name}
          className="w-full object-cover rounded-t-xl aspect-[2/1]"
        />
        {!isGithubPreview && (
          <motion.div
            className={`h-2 w-full ${separatorColor}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        )}
      </div>

      <div className="p-6 pt-1 flex flex-col flex-1">
        <div className="flex-1">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="font-bold text-lg mb-2"
          >
            {name}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-gray-600 text-sm"
          >
            {description}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center justify-between mt-6"
        >
          <div className="flex items-center gap-3">
            {language && <Badge label={language} />}

            {!isGithubPreview && (
              <div className="flex items-center gap-3 text-gray-600">
                {stars > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 stroke-[1.5]" />
                    <span className="text-sm font-medium">{stars}</span>
                  </div>
                )}
                {forks > 0 && (
                  <div className="flex items-center gap-1.5">
                    <GitFork className="w-4 h-4 stroke-[1.5]" />
                    <span className="text-sm font-medium">{forks}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href={url}
              target="_blank"
              className="group p-2 bg-[#B9FF66] rounded-lg border-1 border-black hover:bg-[#a5e65c] transition-all duration-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              <Github className="w-4 h-4 stroke-[1.5] transition-transform duration-200 group-hover:scale-110" />
            </Link>
            {homepage && (
              <Link
                href={homepage}
                target="_blank"
                className="group p-2 bg-white rounded-lg border-1 border-black hover:bg-gray-50 transition-all duration-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                <ExternalLink className="w-4 h-4 stroke-[1.5] transition-transform duration-200 group-hover:scale-110" />
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
