import { TimelineItem } from "./timeline";

const AnimatedTimelineCard = ({
  title,
  subtitle,
  location,
  duration,
  logo,
  bg,
}: TimelineItem) => {
  return (
    <div
      className={`relative p-6 rounded-xl border-1 border-black border-b-4 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg will-change-transform ${
        logo ? "bg-[#B9FF66]" : "bg-white"
      } ${bg}`}
    >
      <div className="flex items-start gap-4">
        {logo && (
          <div
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border-1 border-black animate-scale-in will-change-transform"
            style={{ animationDelay: "0.2s", animationDuration: "0.7s" }}
          >
            <span className="text-lg">{logo}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className="font-bold text-lg animate-slide-right will-change-transform"
                style={{ animationDelay: "0.1s", animationDuration: "0.7s" }}
              >
                {title}
              </h3>
              <p
                className="text-gray-600 animate-slide-right will-change-transform"
                style={{ animationDelay: "0.2s", animationDuration: "0.7s" }}
              >
                {subtitle}
              </p>
              <p
                className="text-gray-600 text-sm animate-slide-right will-change-transform"
                style={{ animationDelay: "0.3s", animationDuration: "0.7s" }}
              >
                {location}
              </p>
            </div>
            <p
              className="text-sm text-gray-600 animate-slide-left will-change-transform"
              style={{ animationDelay: "0.2s", animationDuration: "0.7s" }}
            >
              {duration.start} - {duration.end || "Present"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTimelineCard;
