"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function ClientResumeButton({ username }: { username: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/resume?username=${username}`);

      if (!response.ok) {
        throw new Error("Failed to generate resume");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error downloading resume:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a
      onClick={handleDownload}
      className={`group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black ${!isLoading ? "hover:bg-[#B9FF66]" : ""} transition-all duration-300 ${isLoading ? "cursor-wait" : "cursor-pointer"}`}
      title="Download Resume"
    >
      <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
        {isLoading ? (
          <Loader2
            size={24}
            strokeWidth={2}
            className="animate-spin text-black"
          />
        ) : (
          <Download size={24} strokeWidth={2} className="text-black" />
        )}
      </span>
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {isLoading ? "Generating Resume..." : "Download Resume"}
      </span>
    </a>
  );
}
