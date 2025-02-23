import ProfileCardClient from "./client";

export default function ProfileCard({ 
  name, 
  username, 
  avatarUrl, 
  bio,
  followers,
  following,
  publicRepos,
  index 
}: { 
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  index: number;
}) {
  return (
    <ProfileCardClient 
      name={name} 
      username={username} 
      avatarUrl={avatarUrl}
      bio={bio}
      followers={followers}
      following={following}
      publicRepos={publicRepos}
      index={index}
    />
  );
}
