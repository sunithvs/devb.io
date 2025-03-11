"use client";
import { useEffect } from "react";
import { Profile } from "@/types/types";
import { useBannerStore } from "@/hooks/banner-store";

export const UserProfileBanner = ({ user }: { user: Profile | null }) => {
  const { setBanner } = useBannerStore();

  useEffect(() => {
    if (user) {
      const hasLinkedIn = user.social_accounts?.some(
        (account) => account.provider.toLowerCase() === "linkedin",
      );

      const hasMedium = user.social_accounts?.some(
        (account) => account.provider.toLowerCase() === "medium",
      );

      // Show banner only if user doesn't have LinkedIn or Medium
      if (!hasLinkedIn || !hasMedium) {
        setBanner({
          show: true,
          text: `${user.name}, enhance your profile by connecting your ${!hasLinkedIn ? "LinkedIn" : ""}${!hasLinkedIn && !hasMedium ? " and " : ""}${!hasMedium ? "Medium" : ""} account!`,
          link: "https://docs.devb.io/#/02.-Integrations-Overview",
          linkText: "Learn how",
        });
      }
    }
  }, [user, setBanner]);

  return null;
};
