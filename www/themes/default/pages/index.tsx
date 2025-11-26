import { Suspense } from "react";
import { ThemePageProps } from "@/types/theme";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { ProjectListSkeleton } from "@/components/skeletons/project-skeleton";
import { TimelineSkeleton } from "@/components/skeletons/timeline-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { MediumBlogsSkeleton } from "@/components/skeletons/medium-blogs-skeleton";
import { getUserLinkedInProfile, getUserMediumBlogs } from "@/lib/api";
import { getLinkedInUsername, getMediumUsername } from "@/lib/data-adapter";

/**
 * Default Theme - Index Page
 * Main profile page showing all sections with streaming support
 */
export default async function DefaultThemeIndexPage({
    data,
    username,
    searchParams
}: ThemePageProps) {
    // We are keeping the original implementation for the page to support streaming
    // The DefaultTheme component created above will be used specifically for the Editor
    // or if we decide to switch to client-side fetching later.

    // Re-importing original components to keep this working
    const { ProfileSection } = await import("@/components/ProfileSection");
    const { AboutSection } = await import("@/components/AboutSection");
    const { LinkedInSection } = await import("@/components/LinkedInSection");
    const { ProjectsSection } = await import("@/components/ProjectsSection");
    const { MediumBlogsSection } = await import("@/components/MediumBlogsSection");

    const { profile, projects } = data;

    // Helper for LinkedIn
    const LinkedInWrapper = async () => {
        const linkedInUsername = getLinkedInUsername(profile);
        if (!linkedInUsername) return null;
        const linkedInData = await getUserLinkedInProfile(linkedInUsername);
        return <LinkedInSection user={profile} linkedInData={linkedInData} />;
    };

    // Helper for Blogs
    const BlogsWrapper = async () => {
        const mediumUsername = getMediumUsername(profile);
        if (!mediumUsername) return null;
        const blogs = await getUserMediumBlogs(mediumUsername);
        return <MediumBlogsSection user={profile} blogs={blogs} />;
    };

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 fade-in">
            <div
                id="left-section"
                className="w-full lg:w-[420px] lg:sticky lg:top-8 lg:self-start space-y-2 flex flex-col items-center lg:items-start"
            >
                <a href="/" className="block">
                    <img
                        src="/images/logo-full.png"
                        alt="devb.io"
                        width={140}
                        height={50}
                        className="h-10 w-auto"
                    />
                </a>

                <Suspense fallback={<ProfileSkeleton />}>
                    <ProfileSection user={profile} username={username} searchParams={searchParams} />
                </Suspense>
            </div>

            <div className="flex-1 space-y-8">
                <Suspense fallback={<AboutSkeleton />}>
                    <AboutSection user={profile} userProjects={projects} />
                </Suspense>

                <Suspense fallback={<TimelineSkeleton />}>
                    <LinkedInWrapper />
                </Suspense>

                <Suspense fallback={<ProjectListSkeleton />}>
                    <ProjectsSection userProjects={projects} />
                </Suspense>

                <Suspense fallback={<MediumBlogsSkeleton />}>
                    <BlogsWrapper />
                </Suspense>
            </div>
        </div>
    );
}
