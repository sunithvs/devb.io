import { ArrowDown } from "lucide-react";
import Timeline from "@/components/timeline";
import { getUserLinkedInProfile, getUserProfile } from "@/lib/api";
import { transformLinkedInData } from "@/utils/transform";

export async function LinkedInSection({ username }: { username: string }) {
  const user = await getUserProfile(username);
  if (!user) return null;

  const linkedInAccount = user?.social_accounts?.find(
    (e) => e.provider === "linkedin",
  );
  const linkedInUsername =
    linkedInAccount?.url?.split("in/").pop()?.replace("/", "") || "";

  if (!linkedInUsername) return null;

  const linkedInData = await getUserLinkedInProfile(linkedInUsername);

  // Check if we have experience or education data
  const hasExperience =
    linkedInData?.experience &&
    Array.isArray(linkedInData.experience) &&
    linkedInData.experience.length > 0;
  const hasEducation =
    linkedInData?.education &&
    Array.isArray(linkedInData.education) &&
    linkedInData.education.length > 0;

  if (!linkedInData || (!hasExperience && !hasEducation)) return null;

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
