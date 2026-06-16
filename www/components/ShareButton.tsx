"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${username}'s Portfolio`,
      text: `Check out ${username}'s professional developer portfolio on devb.io!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied to clipboard!", {
          style: {
            backgroundColor: "#B9FF66",
            color: "black",
            border: "1px solid black",
            fontWeight: "bold",
          },
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleShare}
          className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300 cursor-pointer"
        >
          <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
            {copied ? (
              <Check size={24} className="text-green-600" />
            ) : (
              <Share2 size={24} className="text-black" />
            )}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {copied ? "Link Copied!" : "Share Portfolio"}
      </TooltipContent>
    </Tooltip>
  );
}
