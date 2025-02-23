import HowItWorksCardClient from "./client";

export default function HowItWorksCard({ 
  iconName, 
  title, 
  description, 
  index 
}: { 
  iconName: "Github" | "Search" | "Code";
  title: string;
  description: string;
  index: number;
}) {
  return <HowItWorksCardClient iconName={iconName} title={title} description={description} index={index} />;
}
