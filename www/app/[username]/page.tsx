import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Github,
  Globe,
  Linkedin,
  Twitter,
  User,
} from "lucide-react";
import ResumeDownloadButton from "@/components/ResumeDownloadButton";
import ProjectCard from "@/components/project-card";
import Timeline from "@/components/timeline";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { ProjectListSkeleton } from "@/components/skeletons/project-skeleton";
import { TimelineSkeleton } from "@/components/skeletons/timeline-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import {
  getUserLinkedInProfile,
  getUserProfile,
  getUserProjects,
} from "@/lib/api";
import Badge from "@/app/components/Badge";
import {
  AnimatedCard,
  AnimatedListItem,
  AnimatedPage,
  AnimatedSection,
  AnimatedText,
  AnimatedTitle,
} from "@/app/components/AnimatedContent";
import { transformLinkedInData } from "@/utils/transform";
import {Metadata} from "next";

const iconComponents = {
  linkedin: Linkedin,
  twitter: Twitter,
  generic: Globe,
};

const extractDomainName = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const user = await getUserProfile(params.username);

  return {
    title: `${user?.name || params.username} - Portfolio`,
    description: user?.bio || `Check out ${user?.name || params.username}'s portfolio and projects`,
    openGraph: {
      title: `${user?.name || params.username} - Portfolio`,
      description: user?.bio || `Check out ${user?.name || params.username}'s portfolio and projects`,
      images: [
        {
          url: user?.avatar_url || "",
          width: 400,
          height: 400,
          alt: user?.name || params.username,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user?.name || params.username} - Portfolio`,
      description: user?.bio || `Check out ${user?.name || params.username}'s portfolio and projects`,
      images: [user?.avatar_url || ""],
      creator: `@${params.username}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username;

  const user = await getUserProfile(username);

  const linkedInAccount = user?.social_accounts?.find(
    (e) => e.provider === "linkedin",
  );
  const linkedInUsername = linkedInAccount?.url?.split("/").pop() || "";

  const [userProjects, linkedInData] = await Promise.all([
    getUserProjects(username),
    linkedInUsername ? getUserLinkedInProfile(linkedInUsername) : null,
  ]);

  return (
    <AnimatedPage className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div
        id="left-section"
        className="w-full lg:w-[400px] lg:sticky lg:top-8 lg:self-start space-y-2"
      >
        <Link href="/" className="block">
          <Image
            src="/images/logo-full.png"
            alt="devb.io"
            width={140}
            height={50}
            className="h-10 w-auto"
          />
        </Link>

        {!user ? (
          <ProfileSkeleton />
        ) : (
          <AnimatedSection className="rounded-xl border-[1px] border-black bg-white overflow-hidden">
            <div className="h-28 bg-[linear-gradient(94.26deg,#EAFFD1_31.3%,#B9FF66_93.36%)] relative">
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

            <div className="px-8 pb-4 pt-20">
              <div className="flex flex-col items-start text-left">
                <AnimatedTitle className="font-bold text-2xl mb-2 text-black">
                  {user.name.toUpperCase()}
                </AnimatedTitle>
                <AnimatedText className="text-gray-700 text-md">
                  {user.bio}
                </AnimatedText>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5" />
                  <AnimatedTitle className="font-bold">
                    Connect with me
                  </AnimatedTitle>
                </div>
                <div className="flex flex-wrap gap-3">
                  <AnimatedCard className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300">
                    <a
                      href={`https://github.com/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      className="w-full h-full flex items-center justify-center"
                    >
                      <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
                        <Github
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      </span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        GitHub
                      </span>
                    </a>
                  </AnimatedCard>
                  {user.social_accounts?.map((account) => {
                    if (account.provider.toLowerCase() === "github")
                      return null;
                    const provider = account.provider.toLowerCase();
                    const tooltipText =
                      account.provider === "generic"
                        ? extractDomainName(account.url)
                        : account.provider;

                    return (
                      <AnimatedCard
                        key={account.url}
                        className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300"
                      >
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={tooltipText}
                          className="w-full h-full flex items-center justify-center"
                        >
                          {account.url.includes("devb.io") ? (
                            <Image
                              src="/images/logo.png"
                              alt="devb.io"
                              width={24}
                              height={24}
                            />
                          ) : (
                            <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
                              {(() => {
                                const IconComponent =
                                  iconComponents[
                                    provider as keyof typeof iconComponents
                                  ] || iconComponents.generic;
                                return (
                                  <IconComponent
                                    size={24}
                                    strokeWidth={2}
                                    className="text-black"
                                  />
                                );
                              })()}
                            </span>
                          )}
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            {tooltipText}
                          </span>
                        </a>
                      </AnimatedCard>
                    );
                  })}
                  <ResumeDownloadButton username={username} />
                </div>
              </div>

              {user.achievements?.total_contributions > 0 && (
                <div className="mt-4">
                  <AnimatedTitle className="font-bold mb-4">
                    {user.achievements?.total_contributions} Contributions
                  </AnimatedTitle>
                  <div className="overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ height: "100px" }}
                    >
                      <img
                        className="absolute top-[30%] left-1/2 transform -translate-x-124 -translate-y-1/2 scale-[1]"
                        src={`https://ghchart.rshah.org/5F8417/${user.username}`}
                        alt={`${user.name}'s GitHub contributions`}
                        style={{
                          maxWidth: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        )}
      </div>

      <div className="flex-1 space-y-8">
        <AnimatedSection className="text-2xl font-bold mb-4">
          <AnimatedTitle>
            Get to know me <ArrowDown strokeWidth={2} className="inline" />
          </AnimatedTitle>
        </AnimatedSection>

        {!user ? (
          <AboutSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col gap-4 flex-1">
              <AnimatedCard className="bg-white rounded-xl p-6 border-1 border-black border-b-4">
                <AnimatedTitle className="text-xl font-bold mb-4">
                  💻 Languages
                </AnimatedTitle>
                <div className="flex flex-wrap gap-3">
                  {userProjects?.top_languages?.map((language, index) => (
                    <AnimatedText key={index}>
                      <Badge label={language[0]} />
                    </AnimatedText>
                  ))}
                </div>
              </AnimatedCard>

              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatedCard className="bg-[#B9FF66] rounded-xl p-6 border-1 border-black border-b-4 flex-1">
                  <AnimatedTitle className="font-bold mb-2">
                    Issue Closed
                  </AnimatedTitle>
                  <AnimatedText className="text-2xl font-bold">
                    {user.issues_closed}
                  </AnimatedText>
                </AnimatedCard>

                <AnimatedCard className="bg-white rounded-xl p-6 border-1 border-black border-b-4 flex-1">
                  <AnimatedTitle className="font-bold mb-2">
                    PR Merged
                  </AnimatedTitle>
                  <AnimatedText className="text-2xl font-bold">
                    {user.pull_requests_merged}
                  </AnimatedText>
                </AnimatedCard>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <AnimatedCard className="bg-white rounded-xl p-6 border-1 border-black border-b-4">
                <AnimatedTitle className="text-xl font-bold mb-4">
                  🤔 About
                </AnimatedTitle>
                <AnimatedText className="text-gray-700">
                  {user?.about ||
                    "Here's a professional profile summary that incorporates unique details from your profile: As a seasoned full-stack developer, I leverage my expertise in programming languages such as TypeScript, C, and JavaScript to drive business growth and innovation. With over 29 followers and 81 public repositories, I have established a strong online presence and contributed significantly to the developer community. Currently, I'm learning web development, blockchain, and Data Structures and Algorithms (DSA) to stay ahead of the curve. I'm excited to collaborate with like-minded professionals and tackle exciting projects. You can reach me on LinkedIn or Twitter, or email me at nayanprasad096@gmail.com."}
                </AnimatedText>
              </AnimatedCard>

              <AnimatedCard className="bg-[#B9FF66] rounded-xl p-6 border-1 border-black border-b-4 col-span-2">
                <AnimatedTitle className="text-xl font-bold mb-2">
                  📍 Location
                </AnimatedTitle>
                <AnimatedText>{user?.location || "Kochi"}</AnimatedText>
              </AnimatedCard>
            </div>
          </div>
        )}

        <div>
          {!linkedInData ? (
            <TimelineSkeleton />
          ) : (
            linkedInData.experience?.length > 0 && (
              <>
                <AnimatedTitle className="text-2xl font-bold mb-8">
                  Experience <ArrowDown strokeWidth={2} className="inline" />
                </AnimatedTitle>
                <Timeline
                  items={transformLinkedInData(linkedInData.experience)}
                  backgroundColor="bg-[#B9FF66]"
                />
              </>
            )
          )}
        </div>

        <div>
          {!linkedInData ? (
            <TimelineSkeleton />
          ) : (
            linkedInData.education?.length > 0 && (
              <>
                <AnimatedTitle className="text-2xl font-bold mb-8">
                  Education <ArrowDown strokeWidth={2} className="inline" />
                </AnimatedTitle>
                <Timeline
                  items={transformLinkedInData(linkedInData.education)}
                  backgroundColor="bg-white"
                />
              </>
            )
          )}
        </div>

        <AnimatedSection>
          <AnimatedTitle className="text-2xl font-bold mb-8">
            Projects <ArrowDown strokeWidth={2} className="inline" />
          </AnimatedTitle>
          {!userProjects ? (
            <ProjectListSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userProjects?.top_projects?.map((project, index) => (
                <AnimatedListItem key={project.name} index={index}>
                  <ProjectCard {...project} />
                </AnimatedListItem>
              ))}
            </div>
          )}
        </AnimatedSection>
      </div>
    </AnimatedPage>
  );
}
