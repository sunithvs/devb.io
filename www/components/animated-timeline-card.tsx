'use client';

import { motion } from "framer-motion";
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`relative p-6 rounded-xl border-1 border-black border-b-4 ${
        logo ? "bg-[#B9FF66]" : "bg-white"
      } ${bg}`}
    >
      <div className="flex items-start gap-4">
        {logo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border-1 border-black"
          >
            <span className="text-lg">{logo}</span>
          </motion.div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-bold text-lg"
              >
                {title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600"
              >
                {subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 text-sm"
              >
                {location}
              </motion.p>
            </div>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-600"
            >
              {duration.start} - {duration.end || "Present"}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedTimelineCard;
