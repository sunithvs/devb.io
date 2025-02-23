import ProfileCard from "./profile-card";

interface Profile {
  name: string;
  username: string;
  avatarUrl: string;
}

interface ProfileSectionProps {
  title: string;
  profiles: Profile[];
}

const ProfileSection = ({ title, profiles }: ProfileSectionProps) => {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8 inline-block py-1 px-4 bg-[#B9FF66] rounded-full">
          {title}
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {profiles.map((profile, index) => (
            <ProfileCard
              key={index}
              name={profile.name}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
