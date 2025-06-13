import React from "react";
import { Metadata } from "next";
import { getProfileData } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getProfileData(username);
  return {
    title: user
      ? user.seo.title
      : `Devb.io - Build Stunning Developer Portfolios in Minutes`,
    description: user
      ? user.seo.description
      : `Passionate developer skilled in modern technologies, building and learning through real-world projects and daily challenges.`,
    keywords: user
      ? user.seo.keywords
      : "Developer Portfolio, Devb.io, Software Engineer, Projects, Resume, GitHub Showcase",

    openGraph: {
      images: user?.avatar_url,
    },
    twitter: {
      images: user?.avatar_url,
    },
  };
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
