import { ArrowDown } from "lucide-react";
import Timeline from "@/components/timeline";
import { getUserProfile, getUserLinkedInProfile } from "@/lib/api";
import { transformLinkedInData } from "@/utils/transform";

export async function EducationSection({ username }: { username: string }) {
  const user = await getUserProfile(username);
  if (!user) return null;
  
  const linkedInAccount = user?.social_accounts?.find(
    (e) => e.provider === "linkedin",
  );
  const linkedInUsername = linkedInAccount?.url?.split("in/").pop()?.replace("/", "") || "";
  
  if (!linkedInUsername) return null;
  
  const linkedInData = await getUserLinkedInProfile(linkedInUsername);
  
  if (!linkedInData || !linkedInData.education?.length) return null;
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">
        Education <ArrowDown strokeWidth={2} className="inline" />
      </h2>
      <Timeline
        items={transformLinkedInData(linkedInData.education)}
        backgroundColor="bg-white"
      />
    </div>
  );
}
