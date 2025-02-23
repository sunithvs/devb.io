import { Skeleton } from "@/components/ui/skeleton";

export function ProjectSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-full mb-4" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-16" />
        ))}
      </div>
    </div>
  );
}

export function ProjectListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3].map((i) => (
        <ProjectSkeleton key={i} />
      ))}
    </div>
  );
}
