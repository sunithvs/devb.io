'use client';

import ResumeDownloadButton from "./ResumeDownloadButton";

export default function ClientResumeButton({ username }: { username: string }) {
  return <ResumeDownloadButton username={username} />;
}
