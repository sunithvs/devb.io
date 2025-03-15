"use client";
import { useEffect } from "react";
import { Profile } from "@/types/types";
import { useBannerStore } from "@/hooks/banner-store";
import { useSearchParams } from "next/navigation";

export const UserProfileBanner = ({ user }: { user: Profile | null }) => {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const { setBanner, hideBanner } = useBannerStore();

  useEffect(() => {
    if (user && ref === "modal") {
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
  }, [user, setBanner, ref]);

  return null;
};
