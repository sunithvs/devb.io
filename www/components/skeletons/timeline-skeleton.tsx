import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export function TimelineSkeleton() {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-black"></div>

      <div className="space-y-6 pl-12">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative p-6 rounded-xl border-1 border-black border-b-4 bg-white"
          >
            <div className="absolute -left-10 top-0 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black bg-black"></div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg ">
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
