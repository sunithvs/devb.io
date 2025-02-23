import Image from "next/image";

interface ProfileCardProps {
  name: string;
  username: string;
  avatarUrl: string;
}

const ProfileCard = ({ name, username, avatarUrl }: ProfileCardProps) => {
  return (
    <div className="flex gap-2 bg-white p-8 w-full  rounded-[30px] border-2 border-b-[4px] md:border-b-[5px] border-black">
      <div className="w-1/4 flex justify-center items-center">
        <Image
          src={avatarUrl}
          alt={name}
          width={52}
          height={52}
          className="rounded-full"
        />
      </div>
      <div className="flex flex-col gap-1 w-3/4 line-clamp-2 break-words">
        <h3 className="text-xl font-medium text-[#1E1E1E]">{name}</h3>
        <span className="text-base text-[#1E1E1E] opacity-60">@{username}</span>
      </div>
    </div>
  );
};

export default ProfileCard;
