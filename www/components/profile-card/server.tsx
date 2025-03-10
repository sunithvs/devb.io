import ProfileCardClient from "./client";

export default function ProfileCard({
  name,
  username,
  avatarUrl,
  bio,
  index,
}: {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  index: number;
}) {
  return (
    <ProfileCardClient
      name={name}
      username={username}
      avatarUrl={avatarUrl}
      bio={bio}
      index={index}
    />
  );
}
