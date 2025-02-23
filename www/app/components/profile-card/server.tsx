import ProfileCardClient from "./client";

export default function ProfileCard({ name, username, avatarUrl, index }: { 
  name: string;
  username: string;
  avatarUrl: string;
  index: number;
}) {
  return <ProfileCardClient name={name} username={username} avatarUrl={avatarUrl} index={index} />;
}
