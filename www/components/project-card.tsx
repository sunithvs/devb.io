import React from "react";
import Link from "next/link";
import { Project } from "@/types/types";
import { Circle, ExternalLink, GitFork, Github, Star } from "lucide-react";


const ProjectCard = ({
  name,
  description,
  language,
  stars,
  url,
  homepage,
  forks,
}: Project) => {
  const previewUrl = `https://api.microlink.io?url=${encodeURIComponent(homepage || url)}&screenshot=true&embed=screenshot.url`;

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
      <img
        src={previewUrl}
        alt={name}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg mb-2">{name}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-6 text-gray-600 ">
        <div className={"flex gap-2"}>
          {language && (
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 fill-yellow-400 stroke-none" />
              <span className="text-sm">{language}</span>
            </div>
          )}
        </div>

          <div className={"flex flex-col gap-2"}>
              <div className={"flex gap-1"}>
                  <div className="flex items-center gap-2 ju">
                      <Star className="w-4 h-4 fill-current"/>
                      <span className="text-sm">{stars}</span>
                  </div>
                  {forks > 0 && (
                      <div className="flex items-center gap-2">
                          <GitFork className="w-4 h-4"/>
                          <span className="text-sm">{forks}</span>
                      </div>
                  )}
              </div>
              <div className="flex gap-2">
                  <Link
                      href={url}
                      target="_blank"
                      className="p-2 bg-[#B9FF66] rounded-lg border-2 border-black hover:bg-[#a5e65c] transition-colors"
                  >
                      <Github className="w-5 h-5"/>
                  </Link>
                  {homepage && (
                      <Link
                          href={homepage}
                          target="_blank"
                          className="p-2 bg-white rounded-lg border-2 border-black hover:bg-gray-50 transition-colors"
                      >
                          <ExternalLink className="w-5 h-5"/>
                      </Link>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};

export default ProjectCard;
