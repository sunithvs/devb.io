"use client";
import { useEffect } from "react";
import { Profile } from "@/types/types";
import { useBannerStore } from "@/hooks/banner-store";

export const UserProfileBanner = ({ user }: { user: Profile | null }) => {
  const { setBanner, hideBanner } = useBannerStore();

  useEffect(() => {
    if (user) {
      const hasLinkedIn = user.social_accounts?.some(
        (account) => account.provider.toLowerCase() === "linkedin",
      );

      if (!hasLinkedIn) {
        setBanner({
          show: true,
          text: `${user.name}, enhance your profile by connecting your LinkedIn account!`,
          link: "https://docs.devb.io/#/02.-Integrations-Overview",
          linkText: "Learn how",
          bannerKey: `linkedin-banner-${user.username}`,
        });
      }
    }

    return () => {
      hideBanner();
    };
  }, [user, setBanner]);

  return null;
};
