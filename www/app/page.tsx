"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { debounce } from "lodash";
import Footer from "@/components/footer";
import ProfileCard from "@/components/profile-card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

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

// Wave animation functions
function generateSineWave(
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  offset: number = 0,
): string {
  const points: string[] = [];
  for (let x = 0; x <= width; x += 5) {
    const y =
      Math.sin((x / width) * 2 * Math.PI * frequency + offset) * amplitude;
    points.push(`${x},${y}`);
  }
  return `M0,0 L${points.join(" L")}`;
}

function generateNoisyWave(
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  noiseLevel: number = 5,
): string {
  const points: string[] = [];
  for (let x = 0; x <= width; x += 5) {
    const baseY = Math.sin((x / width) * 2 * Math.PI * frequency) * amplitude;
    const noise = (Math.random() - 0.5) * noiseLevel;
    points.push(`${x},${baseY + noise}`);
  }
  return `M0,0 L${points.join(" L")}`;
}

const WaveAnimation = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    const speed = 0.001;

    const animate = (currentTime: number) => {
      if (lastTime !== 0) {
        const deltaTime = currentTime - lastTime;
        setOffset((prev) => (prev + deltaTime * speed) % (2 * Math.PI));
      }
      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const width = 1000;
  const height = 200;

  // Update wave paths
  useEffect(() => {
    const noisyWaveGroup = document.querySelector(".noisy-wave");
    const cleanWaveGroup = document.querySelector(".clean-wave");

    if (noisyWaveGroup && cleanWaveGroup) {
      // Noisy wave paths
      const noisyPaths = noisyWaveGroup.querySelectorAll("path");
      noisyPaths[0].setAttribute("d", generateNoisyWave(width, height, 2, 30));
      noisyPaths[1].setAttribute(
        "d",
        generateNoisyWave(width, height, 1.5, 25),
      );
      noisyPaths[2].setAttribute("d", generateNoisyWave(width, height, 3, 20));

      // Clean wave paths
      const cleanPaths = cleanWaveGroup.querySelectorAll("path");
      cleanPaths[0].setAttribute(
        "d",
        generateSineWave(width, height, 2, 30, offset),
      );
      cleanPaths[1].setAttribute(
        "d",
        generateSineWave(width, height, 1.5, 25, offset),
      );
    }
  }, [offset]);

  return null;
};

const useWaveAnimation = () => {
  useEffect(() => {
    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;

      // Get wave paths
      const noisyWavePaths = document.querySelectorAll(".noisy-wave path");
      const cleanWavePaths = document.querySelectorAll(".clean-wave path");

      // Update noisy waves (left side)
      if (noisyWavePaths.length > 0) {
        const noisyWave1 = generateNoisyWave(600, 100, 3, 30, 15);
        const noisyWave2 = generateNoisyWave(600, 100, 2, 25, 10);
        const noisyWave3 = generateNoisyWave(600, 100, 4, 20, 8);

        noisyWavePaths[0].setAttribute("d", noisyWave1);
        noisyWavePaths[1].setAttribute("d", noisyWave2);
        noisyWavePaths[2].setAttribute("d", noisyWave3);
      }

      // Update clean waves (right side)
      if (cleanWavePaths.length > 0) {
        const offset = elapsed * 2;
        const cleanWave1 = generateSineWave(600, 100, 2, 30, offset);
        const cleanWave2 = generateSineWave(
          600,
          100,
          2,
          25,
          offset + Math.PI / 4,
        );

        cleanWavePaths[0].setAttribute("d", cleanWave1);
        cleanWavePaths[1].setAttribute("d", cleanWave2);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
};

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  useWaveAnimation();

  useEffect(() => {
    // Load profiles on component mount
    fetch("https://devb.io/data/processed_users.json")
      .then((response) => response.json())
      .then((data) => {
        setProfiles(Object.values(data));
      })
      .catch((error) => console.error("Error loading profiles:", error));
  }, []);

  const validateUsername = async (username: string) => {
    setIsValidating(true);
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (response.ok) {
        setValidationMessage("Valid GitHub username!");
      } else {
        setValidationMessage("Invalid GitHub username");
      }
    } catch (error) {
      setValidationMessage("Error validating username");
    }
    setIsValidating(false);
  };

  const debouncedValidation = debounce(validateUsername, 1000);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-3">
            <Image
              width={100}
              height={30}
              src="/images/logo-full.png"
              alt="devb.io"
            />
          </div>
          <div className="hidden lg:flex items-center md:gap-14">
            <a href="#" className="hover:text-lime-500 transition-colors">
              Home
            </a>
            <a href="#how-to" className="hover:text-lime-500 transition-colors">
              How It Works
            </a>
            <a
              href="#services"
              className="hover:text-lime-500 transition-colors"
            >
              Services
            </a>
            <a href="#people" className="hover:text-lime-500 transition-colors">
              People
            </a>
          </div>
          <div className="flex gap-3 justify-end items-end rounded-lg">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=sunithvs&repo=devb.io&type=star&count=true&size=large"
              frameBorder="0"
              scrolling="0"
              width="170"
              height="30"
              title="GitHub"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen px-10 pt-20 md:px-24 md:pt-32 pb-0">
        {/* Hero Section */}
        <section className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Automated Developer Portfolios Powered by GitHub & AI
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Transform your GitHub profile into a polished portfolio instantly.
              AI-powered bios, automatic updates, and real-time activity
              tracking.
            </p>
            <button
              onClick={() => setShowGithubModal(true)}
              className="bg-[#B9FF66] text-black px-8 py-3 rounded-lg font-medium text-lg hover:bg-opacity-90 transition-colors border-2 border-black border-b-[4px]"
            >
              Get Started with GitHub
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full aspect-square">
              <Image
                src="/images/hero.png"
                alt="Developer Portfolio Preview"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* 2024 Unwrapped Section */}
        <section id="2024-unwrapped" className="py-10 md:pt-20 mt-10">
          <div className="container md:mx-auto md:px-4">
            <div className="grid grid-cols-1 gap-8">
              <div className="p-2 md:p-8 rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
                <div className="flex flex-col h-full">
                  <div className="mb-4 flex flex-col md:flex-row items-center">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex items-center mb-4">
                        <div className="relative">
                          <svg
                            className="w-28 h-28 animate-spin-slow"
                            viewBox="0 0 100 100"
                          >
                            <path
                              id="curve"
                              d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                              fill="none"
                            />
                            <text>
                              <textPath href="#curve" className="text-[13px]">
                                unwrapped <tspan fill="#70CF00">2024</tspan> |
                                unwrapped <tspan fill="#70CF00">2024</tspan> |
                              </textPath>
                            </text>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:ml-8 flex-col md:flex-row items-center flex-grow">
                      <div className="md:w-4/5 text-center md:text-left">
                        <span className="bg-[#B9FF66] md:px-4 py-2 mb-4 rounded-lg text-2xl font-medium">
                          2024 Unwrapped
                        </span>
                        <div className="flex flex-col gap-4 mt-6">
                          <p className="text-md md:text-lg">
                            Imagine your entire year of coding captured in one
                            beautiful poster. Share your coding journey with the
                            world!
                          </p>
                          <p className="font-medium">No sign-in required</p>
                        </div>
                      </div>
                      <div className="flex items-end md:ml-2 mt-4 md:mt-0">
                        <button
                          className="bg-black text-white px-6 py-3 rounded-lg"
                          onClick={() => setShowGithubModal(true)}
                        >
                          Generate Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

        {/* Wave Animation Section */}
        <section
          id="wave-animation"
          className="pt-12 md:pt-10 lg:mt-20 flex justify-center items-center"
        >
          <div className="container">
            <div className="wave-container rounded-[10px] md:rounded-[30px] flex items-center flex-col bg-[#1E1E1E]">
              <div className="w-full flex text-[#B9FF66] text-[7px] md:text-xs lg:text-xl mt-3">
                <div className="w-full text-center">
                  Scattered Commits, Unstructured Chaos
                </div>
                <div className="w-full text-center">
                  Curated Contributions, Professional Portfolio
                </div>
              </div>
              <div className="w-full h-[200px] relative">
                <svg viewBox="0 0 1200 200" className="w-full h-full">
                  {/* Noisy Wave Group */}
                  <g className="noisy-wave" transform="translate(0, 100)">
                    <path
                      className="wave-primary"
                      strokeWidth="2"
                      stroke="#B9FF66"
                      fill="none"
                    />
                    <path
                      className="wave-secondary"
                      strokeWidth="1.5"
                      stroke="#B9FF66"
                      fill="none"
                      transform="translate(0, 5)"
                    />
                    <path
                      className="wave-detail"
                      strokeWidth="1"
                      stroke="#B9FF66"
                      fill="none"
                      transform="translate(0, -5)"
                    />
                  </g>

                  {/* Logo */}
                  <g transform="translate(570, 65)">
                    <circle
                      className="logo-glow-outer"
                      cx="30"
                      cy="30"
                      r="40"
                      fill="rgba(185, 255, 102, 0.1)"
                    />
                    <circle
                      className="logo-glow-inner"
                      cx="30"
                      cy="30"
                      r="25"
                      fill="rgba(185, 255, 102, 0.2)"
                    />
                    <image
                      href="/logo.svg"
                      x="10"
                      y="10"
                      width="40"
                      height="40"
                    />
                  </g>

                  {/* Clean Wave Group */}
                  <g className="clean-wave" transform="translate(600, 100)">
                    <path
                      className="wave-main"
                      strokeWidth="2"
                      stroke="#B9FF66"
                      fill="none"
                    />
                    <path
                      className="wave-secondary"
                      strokeWidth="1.5"
                      stroke="#B9FF66"
                      fill="none"
                      transform="translate(0, 5)"
                    />
                  </g>
                </svg>
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
              Contributors
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {profiles.map((profile, index) => (
                <ProfileCard
                  key={index}
                  name={profile.name}
                  username={profile.username}
                  avatarUrl={profile.avatar_url}
                />
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </main>

      {/* GitHub Modal */}
      <Dialog open={showGithubModal} onOpenChange={setShowGithubModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Connect with GitHub</h3>
              <p className="text-gray-600">
                Enter your GitHub username to get started
              </p>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="github-username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                GitHub Username
              </label>
              <input
                type="text"
                id="github-username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (e.target.value) {
                    debouncedValidation(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                placeholder="e.g. johndoe"
              />
              {validationMessage && (
                <p
                  className={`mt-1 text-sm ${validationMessage.includes("Valid") ? "text-green-600" : "text-red-600"}`}
                >
                  {validationMessage}
                </p>
              )}
            </div>

            <button
              disabled={
                !username ||
                !validationMessage.includes("Valid") ||
                isValidating
              }
              className="w-full bg-[#B9FF66] text-black py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors border-2 border-black border-b-[4px]"
            >
              {isValidating ? "Validating..." : "Continue with GitHub"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
