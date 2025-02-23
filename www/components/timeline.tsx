import React from "react";
import { Education, Experience } from "@/types/types";

export type TimelineItem = {
  title: string;
  subtitle: string;
  location: string;
  duration: {
    start: string;
    end?: string;
  };
  logo?: string;
  bg?: string;
};

interface TimelineProps {
  items: TimelineItem[];
  backgroundColor?: string;
}

const TimelineCard: React.FC<TimelineItem> = ({
  title,
  subtitle,
  location,
  duration,
  logo,
  bg,
}) => {
  return (
    <div
      className={`relative p-6 rounded-xl border-2 border-black border-b-4 ${logo ? "bg-[#B9FF66]" : "bg-white"} ${bg}`}
    >
      <div className="flex items-start gap-4">
        {logo && (
          <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border-2 border-black">
            <span className="text-lg">{logo}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-gray-600">{subtitle}</p>
              <p className="text-gray-600 text-sm">{location}</p>
            </div>
            <p className="text-sm text-gray-600">
              {duration.start} - {duration.end || "Present"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({
  items,
  backgroundColor = "bg-[#B9FF66]",
}) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-black"></div>

      {/* Timeline items */}
      <div className="space-y-6 pl-12">
        {items.map((item, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-9 top-0 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black bg-black"></div>
            <TimelineCard
              {...item}
              bg={index % 2 === 0 ? backgroundColor : "bg-white"}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const transformLinkedInData = (
  data: Experience[] | Education[],
): TimelineItem[] => {
  return data.map((item) => {
    if ("company" in item) {
      // Experience item
      const exp = item as Experience;
      return {
        title: exp.title,
        subtitle: exp.company,
        location: exp.location,
        duration: {
          start: `${exp.duration.start.year} ${exp.duration.start.month ? `${exp.duration.start.month}` : ""}`,
          end: exp.duration.end
            ? `${exp.duration.end.year} ${exp.duration.end.month ? `${exp.duration.end.month}` : ""}`
            : undefined,
        },
        logo: `${exp.company[0]}`,
      };
    } else {
      // Education item
      const edu = item as Education;
      return {
        title: edu.degree,
        subtitle: edu.school,
        location: edu.field || "",
        duration: {
          start: `${edu.duration.start.year}`,
          end: `${edu.duration.end.year}`,
        },
        logo: `${edu.school[0]}`,
      };
    }
  });
};

export default Timeline;
