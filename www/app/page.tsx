"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import Footer from "@/components/footer";
import ProfileCard from "@/components/profile-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Counter from "@/components/counter";

// Types
interface Profile {
  username: string;
  name: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);


  useEffect(() => {
    // Load profiles on component mount
    fetch("https://devb.io/data/processed_users.json")
      .then((response) => response.json())
      .then((data: Record<string, Profile>) => {
        // Type assertion to ensure data matches Profile interface
        setProfiles(Object.values(data).slice(-6));
      })
      .catch((error) => console.error("Error loading profiles:", error));
  }, []);

  // GitHub username validation regex
  const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

  // Validate GitHub username
  const validateGitHubUsername = useCallback(async (username: string) => {
    if (!username) {
      setValidationMessage("");
      setProfile(null);
      return;
    }

    // First check username format
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

  // Create a debounced version that only runs after 500ms of inactivity
  const debouncedValidation = useMemo(
    () => debounce(validateGitHubUsername, 500),
    [validateGitHubUsername]
  );

  // Cleanup the debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedValidation.cancel();
    };
  }, [debouncedValidation]);


  return (
    <>
      {/* Navbar with glass effect */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed w-full bg-white/70 backdrop-blur-md z-50 py-4 shadow-sm border-b border-gray-100"
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <motion.div 
            className="flex gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Image
              width={100}
              height={30}
              src="/images/logo-full.png"
              alt="devb.io"
              className="hover:brightness-110 transition-all"
            />
          </motion.div>
          <div className="hidden lg:flex items-center md:gap-14">
            {["Home", "How It Works", "Services", "People"].map((item, index) => (
              <motion.a
                key={item}
                href={item === "Home" ? "#" : `#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-lime-500 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-lime-500"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </div>
          <motion.div 
            className="flex gap-3 justify-end items-end rounded-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <iframe
              src="https://ghbtns.com/github-btn.html?user=sunithvs&repo=devb.io&type=star&count=true&size=large"
              frameBorder="0"
              scrolling="0"
              width="170"
              height="30"
              title="GitHub"
            />
          </motion.div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="min-h-screen px-10 pt-20 md:px-24 md:pt-32 pb-0 overflow-hidden">
        {/* Hero Section with gradient background */}
        <section className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-transparent to-transparent -z-10 rounded-3xl opacity-50" />
          
          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute -left-8 -top-8 w-20 h-20 bg-[#B9FF66]/20 rounded-full blur-xl"
            />
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Automated Developer Portfolios Powered by GitHub & AI
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl mb-8 text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Transform your GitHub profile into a polished portfolio instantly.
              AI-powered bios, automatic updates, and real-time activity tracking.
            </motion.p>
            <motion.div
              className="flex gap-4 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.button
                onClick={() => setShowGithubModal(true)}
                className="bg-[#B9FF66] text-black px-8 py-3 rounded-xl font-medium text-lg hover:bg-opacity-90 transition-all border-2 border-black border-b-[4px] hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-lime-300 -z-0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", duration: 0.3 }}
                />
              </motion.button>
              <motion.a
                href="#how-it-works"
                className="text-gray-600 hover:text-black transition-colors flex items-center gap-2 group"
                whileHover={{ x: 5 }}
              >
                Learn More
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#B9FF66]/20 rounded-full blur-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
            <div className="relative w-full aspect-square">
              <Image
                src="/images/hero.png"
                alt="Hero"
                fill
                className="object-contain hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </motion.div>
        </section>

        {/* Analytics Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <motion.div className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                1425
              </motion.div>
              <motion.p
                className="text-xl md:text-2xl text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Profiles Generated in 2 Months from Around the Globe
              </motion.p>
              <motion.button
                onClick={() => setShowGithubModal(true)}
                className="bg-[#B9FF66] text-black px-8 py-3 rounded-xl font-medium text-lg hover:bg-opacity-90 transition-all border-2 border-black border-b-[4px] hover:shadow-lg hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                What Are You Waiting For? Generate Yours Now!
              </motion.button>
            </motion.div>
          </div>
        </section>
        {/* Services Grid */}
        <section className="py-10 md:pt-20">
          <div className="container md:mx-auto md:px-4">
            <div className="flex">
              {/* Portfolio Generation */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 order-first md:order-last">
                  <h1 className="text-2xl md:text-4xl leading-tight">
                    Stop Portfolio Panic: <br />
                    Build Yours in a Snap
                  </h1>
                  <p className="text-xl text-gray-600">
                    Staring down a blank screen, dreading the hours it&apos;ll
                    take to build a portfolio? Not anymore! devb.io is your
                    coding BFF, turning your messy GitHub profile into a sleek,
                    professional bio easily, not marathons.
                  </p>
                </div>
                {/* Right Illustration */}
                <div className="flex-1 relative md:order-first">
                  <div className="relative xl:p-20">
                    <Image
                      src="/images/graph.png"
                      alt="Illustration"
                      width={500}
                      height={500}
                      className="w-full rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-to" className="py-10 md:pt-20 mt-10">
          <div className="container md:mx-auto md:px-4">
            <div className="mb-4 md:mb-16 flex flex-col md:flex-row">
              <div className="flex items-center">
                <span className="inline-block bg-[#B9FF66] px-4 rounded-lg text-3xl font-medium mb-4 flex items-center mr-5">
                  How It Works
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {/* Step 1 */}
              <div className="bg-[#B9FF66] p-8 rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
                <div className="flex flex-col h-full">
                  <div className="flex items-center flex-row">
                    <div className="flex flex-row text-left items-center">
                      <span className="text-4xl font-bold mr-4">1</span>
                      <h3 className="text-2xl font-bold">Connect GitHub</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-lg">
                    Link your GitHub account to automatically import your
                    repositories, contributions, and activity.
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="bg-white p-8 rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
                <div className="flex flex-col h-full">
                  <div className="flex items-center flex-row">
                    <div className="flex flex-row text-left items-center">
                      <span className="text-4xl font-bold mr-4">2</span>
                      <h3 className="text-2xl font-bold">AI Enhancement</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-lg">
                    Our AI analyzes your GitHub data to create compelling
                    project descriptions and professional bio.
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="bg-[#B9FF66] p-8 rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
                <div className="flex flex-col h-full">
                  <div className="flex items-center flex-row">
                    <div className="flex flex-row text-left items-center">
                      <span className="text-4xl font-bold mr-4">3</span>
                      <h3 className="text-2xl font-bold">Share & Grow</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-lg">
                    Get a personalized portfolio URL to share with potential
                    employers and track your growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-8 inline-block py-1 px-4 bg-[#B9FF66] rounded-full">
              Recent Profiles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profiles.map((profile, index) => (
                <div key={index} className="rounded-[30px] overflow-hidden">
                  <ProfileCard
                    name={profile.name}
                    username={profile.username}
                    avatarUrl={profile.avatar_url}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </main>

      {/* GitHub Modal */}
      <Dialog open={showGithubModal} onOpenChange={setShowGithubModal}>
        <DialogContent className="max-w-md w-full bg-white rounded-xl p-0 mx-4 overflow-hidden">
          <DialogTitle className="sr-only">GitHub Username Input</DialogTitle>
          <div className="relative">
            {/* Content Container */}
            <div className="flex flex-col">
              {/* Header */}
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

              {/* Input Section */}
              <div className="p-4">
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      const newUsername = e.target.value.trim();
                      setUsername(newUsername);
                      
                      // Clear previous validation state immediately
                      setValidationMessage("");
                      setProfile(null);
                      
                      if (newUsername) {
                        // Quick format check before debouncing
                        if (!GITHUB_USERNAME_REGEX.test(newUsername)) {
                          setValidationMessage("Invalid GitHub username format");
                          return;
                        }
                        // Start debounced API validation
                        debouncedValidation(newUsername);
                      } else {
                        // Clear everything if input is empty
                        debouncedValidation.cancel();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && username.trim()) {
                        // Quick format check before API call
                        if (!GITHUB_USERNAME_REGEX.test(username.trim())) {
                          setValidationMessage("Invalid GitHub username format");
                          return;
                        }
                        // Cancel debounced validation and validate immediately
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
                    {isValidating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#B9FF66] border-t-transparent"/>
                    ) : null}
                  </div>
                </div>

                {/* Validation Message */}
                {validationMessage && !validationMessage.includes("Valid") && (
                  <p className="text-sm text-red-500 mt-2">{validationMessage}</p>
                )}
              </div>

              {/* Profile Preview */}
              <div className={`transition-all duration-300 ${validationMessage.includes("Valid") ? 'opacity-100 max-h-[200px]' : 'opacity-0 max-h-0'} overflow-hidden`}>
                {validationMessage.includes("Valid") && (
                  <div className="px-4 pb-4 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                      <Image
                        src={profile?.avatar_url || ""}
                        alt={profile?.name || username}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-base font-medium mb-1">{profile?.name || username}</h3>
                    <p className="text-gray-500 text-sm">@{username}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <button
                  disabled={!username || !validationMessage.includes("Valid") || isValidating}
                  className="w-full bg-[#B9FF66] text-black py-2 px-4 rounded-lg text-sm font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 
                    transition-all flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"/>
                      Validating...
                    </>
                  ) : validationMessage.includes("Valid") ? (
                    "View Profile"
                  ) : (
                    "Continue with GitHub"
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-3">
                  By continuing, you agree to our{" "}
                  <a href="/terms" className="text-black hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-black hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}
