import GitHubModalClient from "./client";

export default function GitHubModal({ onClose }: { onClose: () => void }) {
  return <GitHubModalClient onClose={onClose} />;
}
