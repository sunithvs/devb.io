import IntegrationCardClient from "./client";

export default function IntegrationCard({ type, index }: { type: "github" | "linkedin" | "medium" | "more"; index: number }) {
  return <IntegrationCardClient type={type} index={index} />;
}
