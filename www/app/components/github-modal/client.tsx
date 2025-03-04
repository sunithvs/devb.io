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
      console.log(err)
      setError("Invalid GitHub username");
      setProfile(null);
    } finally {
      setTimeout(function () {
        setIsValidating(false);
      }, 2000);
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
                  {isValidating ? "Star us on GitHub!" : "Continue"}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="flex gap-1 justify-center items-center w-full">
              <button
                onClick={() => {
                  window.open("https://github.com/sunithvs/devb.io/", "_blank");
                }}
                className="w-full justify-center bg-black text-white px-2 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                <div className="flex gap-1 justify-center items-center">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    width="24"
                    height="24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-l">Star us on GitHub</span>
                </div>
              </button>
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
