import type { Metadata } from "next";
import { getUserProfile } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserProfile(username);

  const title = user?.seo?.title || `${user?.name || username} | Developer Portfolio`;
  const description = user?.seo?.description || user?.bio || `Check out ${user?.name || username}'s developer portfolio on Devb.io. Built with passion and code.`;
  const images = user?.avatar_url ? [user.avatar_url] : [];

  return {
    title,
    description,
    keywords: user?.seo?.keywords || "Developer Portfolio, Devb.io, Software Engineer, Projects, Resume, GitHub Showcase",
    icons: {
      icon: user?.avatar_url || '/favicon.ico',
      shortcut: user?.avatar_url || '/favicon.ico',
      apple: user?.avatar_url || '/favicon.ico',
    },
    openGraph: {
      title,
      description,
      images,
      type: 'profile',
      siteName: 'Devb.io',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
      creator: '@devb_io',
    },
  };
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
