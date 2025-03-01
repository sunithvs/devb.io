import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

export function ProfileSkeleton() {
  return (
    <div className="rounded-xl border-[1px] border-black bg-white">
      <div className="h-28 rounded-xl bg-[linear-gradient(94.26deg,#EAFFD1_31.3%,#B9FF66_93.36%)]" />
      
      <div className="flex flex-col md:block px-4 md:px-8">
        <div className="relative -mt-16 flex justify-center md:block">
          <Skeleton className="h-32 w-32 rounded-xl" />
        </div>
        
        <div className="mt-4 text-center md:text-left">
          <Skeleton className="h-8 w-48 mb-3 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-72 mx-auto md:mx-0" />
        </div>

        <div className="w-full mt-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" />
            <span className="font-bold">Connect with me</span>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton 
                key={i} 
                className="w-12 h-12 rounded-xl border border-black"
              />
            ))}
          </div>
        </div>

        <div className="w-full text-left">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-[100px] w-full rounded-xl mb-4" />
        </div>
      </div>
    </div>
  );
}
