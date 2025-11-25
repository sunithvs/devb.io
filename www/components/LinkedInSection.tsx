import { ArrowDown } from "lucide-react";
import Timeline from "@/components/timeline";
import { transformLinkedInData } from "@/utils/transform";
import { Profile, LinkedInProfile } from "@/types/types";

export async function LinkedInSection({
  user,
  linkedInData
}: {
  user: Profile | null;
  linkedInData: LinkedInProfile | null;
}) {
  try {
    if (!user || !linkedInData) return null;

    // Check if we have experience or education data
    const hasExperience =
      linkedInData?.experience &&
      Array.isArray(linkedInData.experience) &&
      linkedInData.experience.length > 0;
    const hasEducation =
      linkedInData?.education &&
      Array.isArray(linkedInData.education) &&
      linkedInData.education.length > 0;

    if (!hasExperience && !hasEducation) {
      return null;
    }

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
  } catch (error) {
    console.error("Error in LinkedInSection:", error);
    return null; // Return null instead of crashing on error
  }
}
