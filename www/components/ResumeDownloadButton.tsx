'use client';

import React from 'react';
import { Download } from 'lucide-react';
// import { useGetUserProfile, useGetUserProject, useGetUserLinkedInProfile } from '@/hooks/user-hook';

const ResumeDownloadButton = ({ username }: { username: string }) => {
    console.log(username);
  // const { data: userProfile, isLoading: isLoadingProfile } = useGetUserProfile(username);
  // const { data: userProjects, isLoading: isLoadingProjects } = useGetUserProject(username);
  // const { data: userLinkedInProfile, isLoading: isLoadingLinkedIn } = useGetUserLinkedInProfile(username);

  const handleDownload = async () => {
    // Handle download logic here
  };

  return (
    <a
      onClick={handleDownload}
      className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300 cursor-pointer"
      title="Download Resume"
    >
      <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
        <Download size={24} strokeWidth={2} className="text-black" />
      </span>
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        Download Resume
      </span>
    </a>
  );
};

export default ResumeDownloadButton;
