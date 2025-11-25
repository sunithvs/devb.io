"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types/types";
import { ExternalLink, GitFork, Github, Star } from "lucide-react";
import Badge from "@/components/Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const ProjectCard = (project: Project) => {
  const { name, description, languages, stars, url, preview_url, forks } = project;

  const isGithubPreview = !preview_url;
  const previewUrl = isGithubPreview
    ? `https://opengraph.githubassets.com/317f0ed00d6d6d4a22f24b956b3988bc254e791fcfe1955acef5add1764cfb42/${encodeURIComponent(url.split("/")[3])}/${encodeURIComponent(url.split("/")[4])}`
    : `https://api.microlink.io?url=${encodeURIComponent(preview_url)}&screenshot=true&embed=screenshot.url`;

  const getColorIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % SEPARATOR_COLORS.length;
  };

  const separatorColor = SEPARATOR_COLORS[getColorIndex(name)];

  return (
    <div className="bg-white rounded-xl border-1 border-black border-b-4 w-full h-full flex flex-col transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg will-change-transform">
      <div className="relative mb-1 aspect-[2/1]">
        <Image
          src={previewUrl}
          alt={name}
          fill
          className="object-cover rounded-t-xl animate-fade-in will-change-opacity"
          style={{ animationDuration: "0.7s" }}
          unoptimized
        />
        {!isGithubPreview && (
          <div
            className={`h-2 w-full ${separatorColor} origin-left animate-scale-x will-change-transform`}
            style={{ animationDuration: "0.7s", animationDelay: "0.1s" }}
          />
        )}
      </div>

      <div className="p-6 pt-1 flex flex-col flex-1">
        <div className="flex-1">
          <h3
            className="font-bold text-lg mb-2 animate-slide-up will-change-transform"
            style={{ animationDuration: "0.7s", animationDelay: "0.2s" }}
          >
            {name}
          </h3>
          <p
            className="text-gray-600 text-sm animate-slide-up will-change-transform"
            style={{ animationDuration: "0.7s", animationDelay: "0.3s" }}
          >
            {description}
          </p>
        </div>

        <div
          className="flex items-center justify-between mt-6 animate-slide-up will-change-transform"
          style={{ animationDuration: "0.7s", animationDelay: "0.4s" }}
        >
          <div className="flex items-center gap-3">
            {languages && languages.length > 0 && <Badge label={languages[0]} />}

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
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={url}
                  target="_blank"
                  className="group p-2 bg-[#B9FF66] rounded-lg border-1 border-black hover:bg-[#a5e65c] transition-all duration-300 ease-out hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  <Github className="w-4 h-4 stroke-[1.5] transition-transform duration-300 ease-out group-hover:scale-110" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>View on GitHub</TooltipContent>
            </Tooltip>

            {preview_url && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={preview_url}
                    target="_blank"
                    className="group p-2 bg-white rounded-lg border-1 border-black hover:bg-gray-50 transition-all duration-300 ease-out hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[1.5] transition-transform duration-300 ease-out group-hover:scale-110" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Visit Live Site</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
