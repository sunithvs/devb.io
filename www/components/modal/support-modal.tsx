"use client";
import React, { useEffect, useState } from "react";
import { Profile } from "@/types/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import {
  DEVB_BUY_ME_A_COFFEE_LINK,
  DEVB_GITHUB_LINK,
  DEVB_INVITE_LINK,
} from "@/lib/constants";
import Image from "next/image";

export const SupportModal = ({ user }: { user: Profile | null }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOpen(!user?.cached || false);
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(DEVB_INVITE_LINK)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-black border-1 border-b-4 rounded-3xl">
        <div className="p-6 pt-8">
          <div className="bg-[#B9FF66] inline-block px-4 py-2 rounded-lg mb-4">
            <DialogTitle className="text-xl font-bold">
              Keep us motivated
            </DialogTitle>
          </div>

          <p className="mb-6 font-medium">
            Our devs are running on caffeine and copium. Help us keep the lights
            on!
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
            {/* Invite Friends Card */}
            <div
              onClick={copyToClipboard}
              className="flex flex-col items-center p-5 text-center bg-[#f3ffd8] rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg relative group overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Copy className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                😌
              </div>
              <h3 className="mb-2 text-lg font-semibold transition-all duration-300 group-hover:text-[#4a9e00]">
                Invite 2 Friends
              </h3>
              <p className="text-sm text-gray-700">
                More users = fewer existential crises.
              </p>

              {copied && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl animate-fade-in-out">
                  <div className="bg-[#B9FF66] text-black font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2 border border-black">
                    <Check className="w-5 h-5 text-black" />
                    <span>Link copied!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fuel Code Card */}
            <div
              onClick={() => openInNewTab(DEVB_GITHUB_LINK)}
              className="flex flex-col items-center p-5 text-center bg-[#ffde30] rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg relative group overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                ☕
              </div>
              <h3 className="mb-2 text-lg font-semibold transition-all duration-300 group-hover:text-[#b07800]">
                Fuel our code
              </h3>
              <Image
                src={"/images/bmc.svg"}
                alt={"bmc"}
                height={150}
                width={150}
              />
            </div>

            {/* Star GitHub Card */}
            <div
              onClick={() => openInNewTab(DEVB_BUY_ME_A_COFFEE_LINK)}
              className="flex flex-col items-center p-5 text-center bg-[#fff8d8] rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg relative group overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                ⭐
              </div>
              <h3 className="mb-2 text-lg font-semibold transition-all duration-300 group-hover:text-[#d4a500]">
                Star our GitHub
              </h3>
              <p className="text-sm text-gray-700">
                Because stars warm our hearts.
              </p>
            </div>
          </div>
        </div>

        <DialogClose className="absolute top-3 right-3 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200">
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
