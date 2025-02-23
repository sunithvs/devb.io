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

const Page = ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = use(params);
  const { data: user } = useGetUserProfile(username);
  const { data: userProjects } = useGetUserProject(username);
  const { data: linkedInData } = useGetUserLinkedInProfile(username);

  if (!user || !userProjects) {
    return <div>user.not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex gap-8">
      <div className="w-[400px] space-y-6">
        <Link href="/" className="block">
          <Image
            src="/images/logo.png"
            alt="devb.io"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {/* user.Card */}
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
      </div>

      {/* Right Section */}
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-8">Get to know me ↓</h2>

          <div className="flex gap-4">
            <div className={"flex flex-col gap-4 flex-1"}>
              <div className="bg-[#B9FF66] rounded-xl p-6 border-2 border-black border-b-4">
                <h2 className="text-xl font-bold mb-4">📝 Bio</h2>
                <p className="text-gray-700">
                  {user.bio || "i own a computer 💻"}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
                <h2 className="text-xl font-bold mb-4">💻 Languages</h2>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-gray-100 rounded-lg border-2 border-black">
                    TypeScript
                  </span>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg border-2 border-black">
                    C
                  </span>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg border-2 border-black">
                    JavaScript
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#B9FF66] rounded-xl p-6 border-2 border-black border-b-4">
                  <h3 className="font-bold mb-2">Issue Closed</h3>
                  <p className="text-2xl font-bold">1</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
                  <h3 className="font-bold mb-2">PR Merged</h3>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </div>

            <div className={"flex flex-col gap-4"}>
              <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
                <h2 className="text-xl font-bold mb-4">🤔 About</h2>
                <p className="text-gray-700">
                  {user.about ||
                    "Here's a professional profile summary that incorporates unique details from your profile: As a seasoned full-stack developer, I leverage my expertise in programming languages such as TypeScript, C, and JavaScript to drive business growth and innovation. With over 29 followers and 81 public repositories, I have established a strong online presence and contributed significantly to the developer community. Currently, I'm learning web development, blockchain, and Data Structures and Algorithms (DSA) to stay ahead of the curve. I'm excited to collaborate with like-minded professionals and tackle exciting projects. You can reach me on LinkedIn or Twitter, or email me at nayanprasad096@gmail.com."}
                </p>
              </div>

              <div className="bg-[#B9FF66] rounded-xl p-6 border-2 border-black border-b-4 col-span-2">
                <h2 className="text-xl font-bold mb-2">📍 Location</h2>
                <p>{user.location || "Kochi"}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8">Github Activity ↓</h2>
          <h3 className="text-xl font-bold mb-2 mx-3 text-left ">
            {user.achievements.total_contributions}
            Contributions
          </h3>
          <img
            className="w-full rounded-xl p-2 md:p-6 border-[1px] border-b-[6px] border-black"
            // src="https://ghchart.rshah.org/191A23/{{ profile.username }}"
            src={`https://ghchart.rshah.org/191A23/${username}`}
            alt="{{ profile.name }}'s github Chart"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8">Projects ↓</h2>
          <div className="grid grid-cols-2 gap-4">
            {userProjects?.top_projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8">Experience ↓</h2>
          {linkedInData && linkedInData.experience && (
            <Timeline
              items={transformLinkedInData(linkedInData.experience)}
              backgroundColor="bg-[#B9FF66]"
            />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8">Education ↓</h2>
          {linkedInData && linkedInData.education && (
            <Timeline
              items={transformLinkedInData(linkedInData.education)}
              backgroundColor="bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
