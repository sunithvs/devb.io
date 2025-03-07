"use client";

import { useCallback, useMemo, useState } from "react";
import { debounce } from "lodash";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Profile {
  username: string;
  name: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GitHubModal({
  isOpen,
  onOpenChange,
}: GitHubModalProps) {
  const [username, setUsername] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  // GitHub username validation regex
  const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

  // Validate GitHub username
  const validateGitHubUsername = useCallback(async (username: string) => {
    if (!username) {
      setValidationMessage("");
      setProfile(null);
      return;
    }

    if (!GITHUB_USERNAME_REGEX.test(username)) {
      setValidationMessage("Invalid GitHub username format");
      setProfile(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);

      if (response.status === 403) {
        setValidationMessage("Too many requests. Please try again later.");
        setProfile(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setValidationMessage("Valid GitHub username!");
      } else {
        setValidationMessage("GitHub user not found");
        setProfile(null);
      }
    } catch (error) {
      console.error("Error validating username:", error);
      setValidationMessage("Error validating username");
      setProfile(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const debouncedValidation = useMemo(
    () => debounce(validateGitHubUsername, 500),
    [validateGitHubUsername],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-white rounded-xl p-0 mx-4 overflow-hidden">
        <DialogTitle className="sr-only">GitHub Username Input</DialogTitle>
        <div className="relative">
          <div className="flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/github-mark.png"
                  alt="GitHub"
                  width={24}
                  height={24}
                  className="opacity-90"
                />
                <h2 className="text-base font-semibold">GitHub Username</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const newUsername = e.target.value.trim();
                    setUsername(newUsername);

                    setValidationMessage("");
                    setProfile(null);

                    if (newUsername) {
                      if (!GITHUB_USERNAME_REGEX.test(newUsername)) {
                        setValidationMessage("Invalid GitHub username format");
                        return;
                      }
                      debouncedValidation(newUsername);
                    } else {
                      debouncedValidation.cancel();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && username.trim()) {
                      if (!GITHUB_USERNAME_REGEX.test(username.trim())) {
                        setValidationMessage("Invalid GitHub username format");
                        return;
                      }
                      debouncedValidation.cancel();
                      validateGitHubUsername(username.trim());
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                    focus:ring-1 focus:ring-[#B9FF66] focus:border-[#B9FF66] transition-all
                    placeholder:text-gray-400"
                  placeholder="Enter GitHub username"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#B9FF66] border-t-transparent" />
                  )}
                </div>
              </div>

              {validationMessage && !validationMessage.includes("Valid") && (
                <p className="text-sm text-red-500 mt-2">{validationMessage}</p>
              )}
            </div>

            <div
              className={`transition-all duration-300 ${validationMessage.includes("Valid") ? "opacity-100 max-h-[200px]" : "opacity-0 max-h-0"} overflow-hidden`}
            >
              {validationMessage.includes("Valid") && profile && (
                <div className="px-4 pb-4 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.name || username}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-base font-medium mb-1">
                    {profile.name || username}
                  </h3>
                  <p className="text-gray-500 text-sm">@{username}</p>
                </div>
              )}
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => {
                  if (username && validationMessage.includes("Valid")) {
                    window.location.href = `/generate/${username}`;
                  }
                }}
                disabled={
                  !username ||
                  !validationMessage.includes("Valid") ||
                  isValidating
                }
                className="w-full bg-[#B9FF66] text-black py-2 px-4 rounded-lg text-sm font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 
                  transition-all flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                    Validating...
                  </>
                ) : validationMessage.includes("Valid") ? (
                  "View Profile"
                ) : (
                  "Continue with GitHub"
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
