import { Education, Experience } from "@/types/types";
import { getMonth } from "@/utils/utils";
import { TimelineItem } from "@/components/timeline";

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
          start: `${exp.duration.start?.year} ${exp.duration.start?.month ? `${getMonth(exp.duration.start?.month)}` : ""}`,
          end: exp.duration.end
            ? `${exp.duration.end?.year} ${exp.duration.end?.month ? `${getMonth(exp.duration.end?.month)}` : ""}`
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
          start: `${edu.duration.start?.year}`,
          end: `${edu.duration.end?.year}`,
        },
        logo: `${edu.school[0]}`,
      };
    }
  });
};
