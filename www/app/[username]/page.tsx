import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { ProjectListSkeleton } from "@/components/skeletons/project-skeleton";
import { TimelineSkeleton } from "@/components/skeletons/timeline-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { ProfileSection } from "@/app/components/ProfileSection";
import { AboutSection } from "@/app/components/AboutSection";
import { ExperienceSection } from "@/app/components/ExperienceSection";
import { EducationSection } from "@/app/components/EducationSection";
import { ProjectsSection } from "@/app/components/ProjectsSection";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

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
          <ProfileSection username={username} />
        </Suspense>
      </div>

      <div className="flex-1 space-y-8">
        <Suspense fallback={<AboutSkeleton />}>
          <AboutSection username={username} />
        </Suspense>

        <Suspense fallback={<TimelineSkeleton />}>
          <ExperienceSection username={username} />
        </Suspense>

        <Suspense fallback={<TimelineSkeleton />}>
          <EducationSection username={username} />
        </Suspense>

        <Suspense fallback={<ProjectListSkeleton />}>
          <ProjectsSection username={username} />
        </Suspense>
      </div>
    </div>
  );
}
