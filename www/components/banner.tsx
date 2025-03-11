"use client";
import React from "react";
import { useBannerStore } from "@/hooks/banner-store";
import Link from "next/link";
import { X } from "lucide-react";

export const Banner = () => {
  const { data, hideBanner } = useBannerStore();

  if (!data.show) return null;

  return (
    <div className="w-full py-2 px-4 text-center z-50 sticky top-0 bg-gradient-to-r from-pink-600 to-purple-600 ">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base">
        <p>{data.text}</p>
        {data.link && data.linkText && (
          <Link
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:no-underline"
          >
            {data.linkText}
          </Link>
        )}
      </div>
      <button
        onClick={hideBanner}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Close banner"
      >
        <X size={16} />
      </button>
    </div>
  );
};
