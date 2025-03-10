"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BlogPost } from "@/app/utils/blog";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export default function BlogCardClient({ post, index }: BlogCardProps) {
  const date = new Date(post.pubDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      <div className="aspect-video relative">
        <Image
          src={post.thumbnail || "/images/placeholder.png"}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">{date}</span>
          {post.categories?.slice(0, 2).map((category) => (
            <span
              key={category}
              className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
            >
              {category}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {post.description.replace(/<[^>]*>/g, "")}
        </p>
      </div>
    </motion.a>
  );
}
