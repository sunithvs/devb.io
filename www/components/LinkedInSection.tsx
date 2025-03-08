"use client";

import { ArrowDown } from "lucide-react";
import Timeline from "@/components/timeline";
import { transformLinkedInData } from "@/utils/transform";
import {
  useGetUserLinkedInProfile,
  useGetUserProfile,
} from "@/hooks/user-hook";
import { TimelineSkeleton } from "@/components/skeletons/timeline-skeleton";

export function LinkedInSection({ username }: { username: string }) {
  const { data: user } = useGetUserProfile(username);

  // Find LinkedIn account from user's social accounts
  const linkedInAccount = user?.social_accounts?.find(
    (e) => e.provider === "linkedin",
  );

  const linkedInUsername =
    linkedInAccount?.url?.split("in/").pop()?.replace("/", "") || "";

  // Only fetch LinkedIn data if we have a username
  const { data: linkedInData, isLoading } =
    useGetUserLinkedInProfile(linkedInUsername);

  // Show loading state while fetching data
  if (isLoading) return <TimelineSkeleton />;

  // If no LinkedIn username or data, return null
  if (!linkedInUsername || !linkedInData) return null;

  // Check if we have experience or education data
  const hasExperience =
    linkedInData?.experience &&
    Array.isArray(linkedInData.experience) &&
    linkedInData.experience.length > 0;
  const hasEducation =
    linkedInData?.education &&
    Array.isArray(linkedInData.education) &&
    linkedInData.education.length > 0;

  if (!hasExperience && !hasEducation) return null;

  return (
    <>
      {hasExperience && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-8">
            Experience <ArrowDown strokeWidth={2} className="inline" />
          </h2>
          <Timeline
            items={
              linkedInData.experience
                ? transformLinkedInData(linkedInData.experience)
                : []
            }
            backgroundColor="bg-[#B9FF66]"
          />
        </div>
      )}

      {hasEducation && (
        <div>
          <h2 className="text-2xl font-bold mb-8">
            Education <ArrowDown strokeWidth={2} className="inline" />
          </h2>
          <Timeline
            items={
              linkedInData.education
                ? transformLinkedInData(linkedInData.education)
                : []
            }
            backgroundColor="bg-white"
          />
        </div>
      )}
    </>
  );
}
