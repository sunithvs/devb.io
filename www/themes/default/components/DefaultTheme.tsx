import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { ProfileData } from "@/types/types";
import { ProfileSection } from "@/components/ProfileSection";
import { AboutSection } from "@/components/AboutSection";
import { LinkedInSection } from "@/components/LinkedInSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { MediumBlogsSection } from "@/components/MediumBlogsSection";

interface DefaultThemeProps {
    data: ProfileData;
    username: string;
}

/**
 * Default Theme - Pure Component
 * Renders the UI based on passed data props
 */
export default function DefaultTheme({
    data,
    username
}: DefaultThemeProps) {
    const { profile, projects, linkedin, blogs } = data;

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

                <ProfileSection user={profile} username={username} searchParams={{}} />
            </div>

            <div className="flex-1 space-y-8">
                <AboutSection user={profile} userProjects={projects} />

                {/* LinkedIn Section - Render if data exists */}
                {linkedin && (
                    <LinkedInSection user={profile} linkedInData={linkedin} />
                )}

                <ProjectsSection userProjects={projects} />

                {/* Blogs Section - Render if data exists */}
                {blogs && (
                    <MediumBlogsSection user={profile} blogs={blogs} />
                )}
            </div>
        </div>
    );
}
