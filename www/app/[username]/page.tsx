import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { ProjectListSkeleton } from "@/components/skeletons/project-skeleton";
import { TimelineSkeleton } from "@/components/skeletons/timeline-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { MediumBlogsSkeleton } from "@/components/skeletons/medium-blogs-skeleton";
import { ProfileSection } from "@/components/ProfileSection";
import { AboutSection } from "@/components/AboutSection";
import { LinkedInSection } from "@/components/LinkedInSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { MediumBlogsSection } from "@/components/MediumBlogsSection";
import { getUserProfile, getUserProjects, getUserLinkedInProfile, getUserMediumBlogs } from "@/lib/api";
import { Profile } from "@/types/types";

export const maxDuration = 60;

// Wrapper component for LinkedIn data with streaming
async function LinkedInSectionWrapper({ user }: { user: Profile | null }) {
  if (!user) return null;

  const linkedInAccount = user?.social_accounts?.find(
    (e) => e.provider === "linkedin",
  );
  const linkedInUsername =
    linkedInAccount?.url?.split("in/").pop()?.replace("/", "") || "";

  if (!linkedInUsername) return null;

  const linkedInData = await getUserLinkedInProfile(linkedInUsername);

  return <LinkedInSection user={user} linkedInData={linkedInData} />;
}

// Wrapper component for Medium blogs with streaming
async function MediumBlogsSectionWrapper({ user }: { user: Profile | null }) {
  if (!user) return null;

  const mediumAccount = user?.social_accounts?.find(
    (account) =>
      account.provider === "generic" && account.url.includes("medium.com"),
  );

  if (!mediumAccount) return null;

  const mediumUsername = mediumAccount.url.split("@")[1];
  if (!mediumUsername) return null;

  const blogs = await getUserMediumBlogs(mediumUsername);

  return <MediumBlogsSection user={user} blogs={blogs} />;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { username } = await params;
  const urlSearchParams = await searchParams;

  if (!username) return null;

  // Fetch fast API calls immediately
  const user = await getUserProfile(username);
  const userProjects = await getUserProjects(username);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 fade-in">
      <div
        id="left-section"
        className="w-full lg:w-[420px] lg:sticky lg:top-8 lg:self-start space-y-2 flex flex-col items-center lg:items-start"
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

        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileSection user={user} username={username} searchParams={urlSearchParams} />
        </Suspense>
      </div>

      <div className="flex-1 space-y-8">
        <Suspense fallback={<AboutSkeleton />}>
          <AboutSection user={user} userProjects={userProjects} />
        </Suspense>

        <Suspense fallback={<TimelineSkeleton />}>
          <LinkedInSectionWrapper user={user} />
        </Suspense>

        <Suspense fallback={<ProjectListSkeleton />}>
          <ProjectsSection userProjects={userProjects} />
        </Suspense>

        <Suspense fallback={<MediumBlogsSkeleton />}>
          <MediumBlogsSectionWrapper user={user} />
        </Suspense>
      </div>
    </div>
  );
}
