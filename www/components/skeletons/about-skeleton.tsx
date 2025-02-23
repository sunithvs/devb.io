import { Skeleton } from "@/components/ui/skeleton";

export function AboutSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-4" /> {/* "Get to know me" title */}
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          {/* Bio Section */}
          <div className="bg-[#B9FF66] rounded-xl p-6 border-2 border-black border-b-4">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Languages Section */}
          <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-[#B9FF66] rounded-xl p-6 border-2 border-black border-b-4 flex-1">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4 flex-1">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* About Section */}
          <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-[#B9FF66] rounded-xl p-6 border-2 border-black border-b-4">
            <Skeleton className="h-6 w-28 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
