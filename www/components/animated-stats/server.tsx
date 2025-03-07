import AnimatedStatsClient from "./client";

export default function AnimatedStats({
  value,
  subtitle,
}: {
  value: number;
  subtitle: string;
}) {
  return <AnimatedStatsClient value={value} subtitle={subtitle} />;
}
