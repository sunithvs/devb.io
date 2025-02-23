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
      <div className="w-full lg:w-[400px] space-y-6">
        <Link href="/" className="block">
          <Image
            src="/images/logo.png"
            alt="devb.io"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {isUserDataLoading || !user ? (
          <ProfileSkeleton />
        ) : (
          <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
            <div className="flex flex-col items-center text-center mb-6">
              <Image
                src={user.avatar_url}
                alt={user?.name}
                width={96}
                height={96}
                className="rounded-full mb-4"
              />
              <h2 className="font-bold text-xl">{user.name}</h2>
              <p className="text-gray-700">@{user.username}</p>
            </div>

            <div className="mt-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center border-2 border-black border-b-4 rounded-xl p-6">
                  <p className="font-bold text-xl">{user.followers}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center border-2 border-black border-b-4 rounded-xl p-6">
                  <p className="font-bold text-xl">{user.following}</p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
                <div className="text-center border-2 border-black border-b-4 rounded-xl p-6">
                  <p className="font-bold text-xl">{user.public_repos}</p>
                  <p className="text-sm text-gray-600">Repos</p>
                </div>
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
                <div className="bg-[#B9FF66] rounded-xl p-6 border-1 border-black border-b-4">
                  <h2 className="text-xl font-bold mb-4">📝 Bio</h2>
                  <p className="text-gray-700">
                    {user?.bio || "i own a computer 💻"}
                  </p>
                </div>

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
          <h2 className="text-2xl font-bold mb-8">
            Experience <ArrowDown strokeWidth={2} className="inline" />
          </h2>
          {isUserLinkedInDataLoading || !linkedInData ? (
            <TimelineSkeleton />
          ) : (
            linkedInData &&
            linkedInData.experience && (
              <Timeline
                items={transformLinkedInData(linkedInData.experience)}
                backgroundColor="bg-[#B9FF66]"
              />
            )
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8">
            Education <ArrowDown strokeWidth={2} className="inline" />
          </h2>
          {isUserLinkedInDataLoading || !linkedInData ? (
            <TimelineSkeleton />
          ) : (
            linkedInData &&
            linkedInData.education && (
              <Timeline
                items={transformLinkedInData(linkedInData.education)}
                backgroundColor="bg-white"
              />
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
