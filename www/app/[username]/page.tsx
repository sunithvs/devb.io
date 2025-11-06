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

export const maxDuration = 60;

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
          <ProfileSection username={username} searchParams={urlSearchParams} />
        </Suspense>
      </div>

      <div className="flex-1 space-y-8">
        <Suspense fallback={<AboutSkeleton />}>
          <AboutSection username={username} />
        </Suspense>

        <Suspense fallback={<TimelineSkeleton />}>
          <LinkedInSection username={username} />
        </Suspense>

        <Suspense fallback={<ProjectListSkeleton />}>
          <ProjectsSection username={username} />
        </Suspense>

        <Suspense fallback={<MediumBlogsSkeleton />}>
          <MediumBlogsSection username={username} />
        </Suspense>
      </div>
    </div>
  );
}
