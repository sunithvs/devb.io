import React from "react";
import Link from "next/link";
import { Project } from "@/types/types";
import { ExternalLink, GitFork, Github, Star } from "lucide-react";
import Badge from "@/app/components/Badge";

const ProjectCard = ({
  name,
  description,
  language,
  stars,
  url,
  homepage,
  forks,
}: Project) => {
  const previewUrl = homepage ? `https://api.microlink.io?url=${encodeURIComponent(homepage)}&screenshot=true&embed=screenshot.url` :
    `https://opengraph.githubassets.com/317f0ed00d6d6d4a22f24b956b3988bc254e791fcfe1955acef5add1764cfb42/${encodeURIComponent(url.split("/")[3])}/${encodeURIComponent(url.split("/")[4])}`;

  return (
    <div className="bg-white rounded-xl border-1 border-black border-b-4">
      <img
        src={previewUrl}
        alt={name}
        className="w-full h-47 object-cover rounded-t-xl"
      />

      <div className="p-6 pt-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg mb-2">{name}</h3>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {language && <Badge label={language} />}

            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 stroke-[1.5]" />
                <span className="text-sm font-medium">{stars}</span>
              </div>
              {forks > 0 && (
                <div className="flex items-center gap-1.5">
                  <GitFork className="w-4 h-4 stroke-[1.5]" />
                  <span className="text-sm font-medium">{forks}</span>
                </div>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
