import React from "react";

const Badge = ({ label }: { label: string }) => {
  return (
    <span className="px-4 py-2 bg-gray-100 rounded-lg border-black">
      {label}
    </span>
  );
};

export default Badge;
