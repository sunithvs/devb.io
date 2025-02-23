"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Github, X } from "lucide-react";

interface GitHubModalProps {
  onClose: () => void;
}

interface GitHubProfile {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
}

export default function GitHubModal({ onClose }: GitHubModalProps) {
  const [username, setUsername] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const router = useRouter();

  const validateGithubUsername = async (username: string) => {
    if (!username) {
      setError("Please enter a GitHub username");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        throw new Error("GitHub user not found");
      }
      const data = await response.json();
      setProfile({
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name || data.login,
        bio: data.bio || "No bio available"
      });
    } catch (err) {
      setError("Invalid GitHub username");
      setProfile(null);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Github size={32} className="text-black" />
              <h2 className="text-2xl font-bold">GitHub Username</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent text-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") validateGithubUsername(username);
                }}
              />
              {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
              )}
            </div>

            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4 flex items-center gap-4"
              >
                <Image
                  src={profile.avatar_url}
                  alt={profile.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  <p className="text-gray-600 text-sm">{profile.bio}</p>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              {profile ? (
                <button
                  onClick={() => router.push(`/${profile.login}`)}
                  className="flex-1 bg-[#CCFF00] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#b8e600] transition-colors"
                >
                  View Profile
                </button>
              ) : (
                <button
                  onClick={() => validateGithubUsername(username)}
                  disabled={isValidating}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {isValidating ? "Validating..." : "Continue"}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
