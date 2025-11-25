import { Suspense } from "react";
import { ThemePageProps } from "@/types/theme";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { ProjectListSkeleton } from "@/components/skeletons/project-skeleton";
import { TimelineSkeleton } from "@/components/skeletons/timeline-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { MediumBlogsSkeleton } from "@/components/skeletons/medium-blogs-skeleton";
import { getUserLinkedInProfile, getUserMediumBlogs } from "@/lib/api";
import { getLinkedInUsername, getMediumUsername } from "@/lib/data-adapter";
import DefaultTheme from "../components/DefaultTheme";

// Wrapper component for LinkedIn data with streaming
async function LinkedInSectionWrapper({ profile }: { profile: any }) {
    const linkedInUsername = getLinkedInUsername(profile);
    if (!linkedInUsername) return null;
    const linkedInData = await getUserLinkedInProfile(linkedInUsername);
    // We only need to return the data part for the pure component, but here we need to compose it
    // Since DefaultTheme expects all data, we can't easily use it piecewise with Suspense 
    // UNLESS we decompose DefaultTheme or keep the page composition here.

    // STRATEGY: Keep the page composition here for streaming, but use DefaultTheme for the Editor.
    // Wait, if we want to use DefaultTheme in the page too, we need to fetch everything first OR 
    // make DefaultTheme accept promises (RSC) or optional data.

    // For now, let's keep the page as is for streaming performance, 
    // and ONLY use DefaultTheme for the Editor? 
    // OR, better: Re-implement the page to fetch data and render DefaultTheme, 
    // losing streaming for the *initial* paint of the shell, but that's okay for consistency.

    // ACTUALLY: The best approach for the page is to keep streaming.
    // So let's NOT replace the page content entirely with DefaultTheme yet if it breaks streaming.
    // BUT the user wants the editor to work.

    // Let's make DefaultTheme handle missing data gracefully (it already does).
    // And for the Page, we can construct the data object piece by piece? No, that blocks.

    // Compromise: The Page continues to use individual sections for streaming.
    // The Editor uses DefaultTheme which takes all data at once.
    // So I will NOT replace the code in this file to use DefaultTheme, 
    // I will just leave this file mostly as is (or revert my thought process), 
    // and only use DefaultTheme in the Editor.

    // However, to ensure consistency, it's better if they share code.
    // But sharing code between a streaming server page and a synchronous client editor is hard.

    // Let's stick to the plan: Create DefaultTheme for the Editor. 
    // The Page can stay as is for now to preserve streaming performance.
    return null;
}

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
