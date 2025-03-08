import React from "react";
import { Badge as ShadCnBadge } from "@/components/ui/badge";

const Badge = ({ label }: { label: string }) => {
  return <ShadCnBadge variant="secondary">{label}</ShadCnBadge>;
};

export default Badge;
