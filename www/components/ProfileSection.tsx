import Image from "next/image";
import { Github, Globe, Linkedin, Twitter, User } from "lucide-react";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { addUserToNocodb, getUserProfile } from "@/lib/api";
import ClientResumeButton from "@/components/ClientResumeButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SupportModal } from "@/components/modal/support-modal";

// Utility functions
const extractDomainName = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const iconComponents = {
  linkedin: Linkedin,
  twitter: Twitter,
  generic: Globe,
};

export async function ProfileSection({ username }: { username: string }) {
  const user = await getUserProfile(username);
  await addUserToNocodb(user);

  if (!user) return <ProfileSkeleton />;

  return (
    <>
      <div className="rounded-xl border-[1px] border-black bg-white overflow-hidden w-full max-w-md lg:max-w-none border-b-6">
        <div className="h-28 bg-[linear-gradient(94.26deg,#EAFFD1_31.3%,#B9FF66_93.36%)] relative">
          <div className="absolute left-1/2 lg:left-8 bottom-0 translate-x-[-50%] lg:translate-x-0 translate-y-1/2">
            <div className="bg-[#AFE555] rounded-[19px] w-32 h-32 flex items-center justify-center border-7 border-white">
              <Image
                src={user.avatar_url}
                alt={user?.name}
                width={120}
                height={120}
                className="rounded-[16px]"
              />
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 pb-4 pt-20">
          <div className="flex flex-col items-start text-left">
            <h1 className="font-bold text-2xl mb-2 text-black">
              {user.name.toUpperCase()}
            </h1>
            <p className="text-gray-700 text-md">{user.bio}</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              <h2 className="font-bold">Connect with me</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300">
                    <a
                      href={`https://github.com/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      className="w-full h-full flex items-center justify-center "
                    >
                      <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
                        <Github
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      </span>
                    </a>
                  </div>
                </TooltipTrigger>
                <TooltipContent>GitHub</TooltipContent>
              </Tooltip>
              {user.social_accounts?.map((account) => {
                if (account.provider.toLowerCase() === "github") return null;
                const provider = account.provider.toLowerCase();
                const tooltipText =
                  account.provider === "generic"
                    ? extractDomainName(account.url)
                    : account.provider;

                return (
                  <Tooltip key={account.url}>
                    <TooltipTrigger asChild>
                      <div className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300">
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={tooltipText}
                          className="w-full h-full flex items-center justify-center "
                        >
                          {account.url.includes("devb.io") ? (
                            <Image
                              src="/images/logo.png"
                              alt="devb.io"
                              width={24}
                              height={24}
                            />
                          ) : (
                            <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
                              {(() => {
                                const IconComponent =
                                  iconComponents[
                                    provider as keyof typeof iconComponents
                                  ] || iconComponents.generic;
                                return (
                                  <IconComponent
                                    size={24}
                                    strokeWidth={2}
                                    className="text-black"
                                  />
                                );
                              })()}
                            </span>
                          )}
                        </a>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipText}</TooltipContent>
                  </Tooltip>
                );
              })}
              <ClientResumeButton username={username} />
            </div>
          </div>

          {user.achievements?.total_contributions > 0 && (
            <div className="mt-4">
              <h2 className="font-bold mb-4">
                {user.achievements?.total_contributions} Contributions
              </h2>
              <div className="overflow-hidden">
                <div className="relative w-full" style={{ height: "100px" }}>
                  <img
                    className="absolute top-[32%] left-1/2 transform -translate-x-124 -translate-y-1/2 scale-[1]"
                    src={`https://ghchart.rshah.org/5F8417/${user.username}`}
                    alt={`${user.name}'s GitHub contributions`}
                    style={{
                      maxWidth: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <SupportModal user={user} />
    </>
  );
}
