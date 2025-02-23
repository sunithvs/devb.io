import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-black border-b-4">
      <div className="flex flex-col items-center text-center mb-6">
        <Skeleton className="h-24 w-24 rounded-full mb-4" />
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center border-2 border-black border-b-4 rounded-xl p-6">
              <Skeleton className="h-4 w-12 mx-auto mb-2" />
              <Skeleton className="h-6 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
