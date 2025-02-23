import Image from "next/image";
import Footer from "@/components/footer";
import ProfileCard from "@/components/profile-card";
import Counter from "@/components/counter";
import AnimatedNav from "./components/animated-nav/server";
import AnimatedHero from "./components/animated-hero/server";
import AnimatedStats from "./components/animated-stats/server";
import IntegrationCard from "./components/integration-card/server";

// Types
interface Profile {
  username: string;
  name: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
}

async function getProfiles(): Promise<Profile[]> {
  const response = await fetch("https://devb.io/data/processed_users.json", {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  const data: Record<string, Profile> = await response.json();
  return Object.values(data).slice(-6);
}

export default async function Home() {
  const profiles = await getProfiles();

  return (
    <>
      <AnimatedNav />
      
      <main className="min-h-screen px-10 pt-20 md:px-24 md:pt-32 pb-0 overflow-hidden">
        <AnimatedHero />

        {/* Analytics Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <AnimatedStats 
                value={1425} 
                subtitle="Profiles Generated in 2 Months from Around the Globe" 
              />
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-10 md:pt-20">
          <div className="container md:mx-auto md:px-4">
            <div className="flex">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 order-first md:order-last">
                  <h1 className="text-2xl md:text-4xl leading-tight">
                    Stop Portfolio Panic: <br />
                    Build Yours in a Snap
                  </h1>
                  <p className="text-xl text-gray-600">
                    Staring down a blank screen, dreading the hours it&apos;ll
                    take to build a portfolio? Not anymore! devb.io is your
                    coding BFF, turning your messy GitHub profile into a sleek,
                    professional bio easily, not marathons.
                  </p>
                </div>
                <div className="flex-1 relative md:order-first">
                  <div className="relative xl:p-20">
                    <Image
                      src="/images/graph.png"
                      alt="Illustration"
                      width={500}
                      height={500}
                      className="w-full rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Connect Your Developer Identity
              </h2>
              <p className="text-xl text-gray-600">
                Integrate with your favorite platforms to showcase your complete developer profile
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <IntegrationCard type="github" index={0} />
              <IntegrationCard type="linkedin" index={1} />
              <IntegrationCard type="medium" index={2} />
              <IntegrationCard type="more" index={3} />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-to" className="py-10 md:pt-20 mt-10">
          <div className="container md:mx-auto md:px-4">
            <div className="mb-4 md:mb-16 flex flex-col md:flex-row">
              <div className="flex items-center">
                <span className="inline-block bg-[#B9FF66] px-4 rounded-lg text-3xl font-medium mb-4 flex items-center mr-5">
                  How It Works
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-[#B9FF66] p-8 rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
                <div className="flex flex-col h-full">
                  <div className="flex items-center flex-row">
                    <div className="flex flex-row text-left items-center">
                      <span className="text-4xl font-bold mr-4">1</span>
                      <h3 className="text-2xl font-bold">Connect GitHub</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-lg">
                    Link your GitHub account to automatically import your
                    repositories, contributions, and activity.
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
                <div className="flex flex-col h-full">
                  <div className="flex items-center flex-row">
                    <div className="flex flex-row text-left items-center">
                      <span className="text-4xl font-bold mr-4">2</span>
                      <h3 className="text-2xl font-bold">AI Enhancement</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-lg">
                    Our AI analyzes your GitHub data to create compelling
                    project descriptions and professional bio.
                  </p>
                </div>
              </div>
              <div className="bg-[#B9FF66] p-8 rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
                <div className="flex flex-col h-full">
                  <div className="flex items-center flex-row">
                    <div className="flex flex-row text-left items-center">
                      <span className="text-4xl font-bold mr-4">3</span>
                      <h3 className="text-2xl font-bold">Share & Grow</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-lg">
                    Get a personalized portfolio URL to share with potential
                    employers and track your growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Profiles Section */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-8 inline-block py-1 px-4 bg-[#B9FF66] rounded-full">
              Recent Profiles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div key={profile.username} className="rounded-[30px] overflow-hidden">
                  <ProfileCard
                    name={profile.name}
                    username={profile.username}
                    avatarUrl={profile.avatar_url}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
