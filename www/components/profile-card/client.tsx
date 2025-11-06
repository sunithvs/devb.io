"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ProfileCardProps {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  index: number;
}

export default function ProfileCardClient({
  name,
  username,
  avatarUrl,
  bio,
  index,
}: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="aspect-square relative">
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{name}</h3>
        <p className="text-gray-600 text-sm mb-2 truncate">@{username}</p>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bio}</p>

        <a href={`/${username}?utm_source=devb_io&utm_medium=contributor&utm_campaign=devb_io`} target="_blank" rel="noopener noreferrer">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#B9FF66] text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#a7eb54] transition-colors"
          >
            View Profile
          </motion.button>
        </a>
      </div>
    </motion.div>
  );
}
