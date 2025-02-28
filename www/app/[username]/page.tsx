"use client";
import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useGetUserLinkedInProfile,
  useGetUserProfile,
  useGetUserProject,
} from "@/hooks/user-hook";
import ProjectCard from "@/components/project-card";
import Timeline, { transformLinkedInData } from "@/components/timeline";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { ProjectListSkeleton } from "@/components/skeletons/project-skeleton";
import { TimelineSkeleton } from "@/components/skeletons/timeline-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { ArrowDown } from "lucide-react";
import ResumeGenerator from "@/components/ResumeGenerator";

const Page = ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = use(params);
  const { data: user, isLoading: isUserDataLoading } =
    useGetUserProfile(username);
  const { data: userProjects, isLoading: isUserProjectsLoading } =
    useGetUserProject(username);
  const { data: linkedInData, isLoading: isUserLinkedInDataLoading } =
    useGetUserLinkedInProfile(username);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-[400px] space-y-2">
        <Link href="/" className="block">
          <Image
            src="/images/logo-full.png"
            alt="devb.io"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {isUserDataLoading || !user ? (
          <ProfileSkeleton />
        ) : (
          <div className="rounded-[32px] border-[1px] border-black bg-white overflow-hidden">
            <div className="h-36 bg-[linear-gradient(94.26deg,#EAFFD1_31.3%,#B9FF66_93.36%)] relative">
              <div className="absolute left-8 bottom-0 translate-y-1/2">
                <div className="bg-[#AFE555] rounded-[19px] w-32 h-32 flex items-center justify-center">
                  <Image
                    src={user.avatar_url}
                    alt={user?.name}
                    width={120}
                    height={120}
                    className="rounded-[16px]"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-8 pb-8 pt-20">
              <div className="flex flex-col items-start text-left">
                <h2 className="font-bold text-2xl mb-2 text-black">{user.name.toUpperCase()}</h2>
                <p className="text-gray-700 text-md">{user.bio}</p>
              </div>

              <div className="flex gap-2 mt-6 mb-8">
                <a href="#" className="p-3 border-[1px] border-black rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="p-3 border-[1px] border-black rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="p-3 border-[1px] border-black rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>

              <div className="bg-white rounded-[16px] p-4 border-[1px] border-black mb-8">
                <img
                  className="w-full"
                  src={`https://ghchart.rshah.org/2da44e/${user.username}`}
                  alt={`${user.name}'s GitHub contributions`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center bg-white rounded-[16px] p-4 border-[1px] border-black">
                  <p className="font-bold text-3xl mb-1">{user.followers}</p>
                  <p className="text-gray-600">Followers</p>
                </div>
                <div className="text-center bg-white rounded-[16px] p-4 border-[1px] border-black">
                  <p className="font-bold text-3xl mb-1">{user.following}</p>
                  <p className="text-gray-600">Following</p>
                </div>
                <div className="text-center bg-white rounded-[16px] p-4 border-[1px] border-black">
                  <p className="font-bold text-3xl mb-1">{user.public_repos}</p>
                  <p className="text-gray-600">Repos</p>
                </div>
              </div>

              <div className="flex justify-center">
                <ResumeGenerator username={user.username} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-8">
        <h2 className="text-2xl font-bold mb-4">
          Get to know me <ArrowDown strokeWidth={2} className="inline" />
        </h2>

        {isUserDataLoading || !user ? (
          <AboutSkeleton />
        ) : (
          <div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className={"flex flex-col gap-4 flex-1"}>
              
                <div className="bg-white rounded-xl p-6 border-1 border-black border-b-4">
                  <h2 className="text-xl font-bold mb-4">💻 Languages</h2>
                  <div className="flex flex-wrap gap-3">
                    {userProjects?.top_languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 rounded-lg border-black"
                      >
                        {language[0]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="bg-[#B9FF66] rounded-xl p-6 border-1 border-black border-b-4 flex-1">
                    <h3 className="font-bold mb-2">Issue Closed</h3>
                    <p className="text-2xl font-bold">1</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border-1 border-black border-b-4 flex-1">
                    <h3 className="font-bold mb-2">PR Merged</h3>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                </div>
              </div>

              <div className={"flex flex-col gap-4"}>
                <div className="bg-white rounded-xl p-6 border-1 border-black border-b-4">
                  <h2 className="text-xl font-bold mb-4">🤔 About</h2>
                  <p className="text-gray-700">
                    {user?.about ||
                      "Here's a professional profile summary that incorporates unique details from your profile: As a seasoned full-stack developer, I leverage my expertise in programming languages such as TypeScript, C, and JavaScript to drive business growth and innovation. With over 29 followers and 81 public repositories, I have established a strong online presence and contributed significantly to the developer community. Currently, I'm learning web development, blockchain, and Data Structures and Algorithms (DSA) to stay ahead of the curve. I'm excited to collaborate with like-minded professionals and tackle exciting projects. You can reach me on LinkedIn or Twitter, or email me at nayanprasad096@gmail.com."}
                  </p>
                </div>

                <div className="bg-[#B9FF66] rounded-xl p-6 border-1 border-black border-b-4 col-span-2">
                  <h2 className="text-xl font-bold mb-2">📍 Location</h2>
                  <p>{user?.location || "Kochi"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-8">
            Github Activity <ArrowDown strokeWidth={2} className="inline" />
          </h2>
          <h3 className="text-xl font-bold mb-2 mx-3 text-left ">
            {user?.achievements.total_contributions} Contributions
          </h3>
          <img
            className="w-full rounded-xl p-2 md:p-6 border-[1px] border-b-[6px] border-black"
            src={`https://ghchart.rshah.org/191A23/${username}`}
            alt="{{ profile.name }}'s github Chart"
          />
        </div>

        <div>

          {isUserLinkedInDataLoading || !linkedInData ? (
            <TimelineSkeleton />
          ) : (
            linkedInData &&
            linkedInData.experience.length > 0 && (
             <>
                 <h2 className="text-2xl font-bold mb-8">
            Experience <ArrowDown strokeWidth={2} className="inline" />
          </h2>
               <Timeline
                items={transformLinkedInData(linkedInData.experience)}
                backgroundColor="bg-[#B9FF66]"
              />
             </>
            )
          )}
        </div>

        <div>

          {isUserLinkedInDataLoading || !linkedInData ? (
            <TimelineSkeleton />
          ) : (
            linkedInData &&
            linkedInData.education.length > 0 && (
                <>
                 <h2 className="text-2xl font-bold mb-8">
            Education <ArrowDown strokeWidth={2} className="inline" />
          </h2>
                <Timeline
                items={transformLinkedInData(linkedInData.education)}
                backgroundColor="bg-white"
              />
                </>

            )
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8">
            Projects <ArrowDown strokeWidth={2} className="inline" />
          </h2>
          {isUserProjectsLoading ? (
            <ProjectListSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userProjects?.top_projects.map((project) => (
                <ProjectCard key={project.name} {...project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
