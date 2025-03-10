export const MediumBlogsSkeleton = () => {
  return (
    <>
      <div className="h-8 w-48 bg-gray-200 rounded-md mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl border-1 border-black border-b-4 flex flex-col h-full overflow-hidden"
          >
            <div className="bg-gray-200 h-40 animate-pulse"></div>
            <div className="p-6 flex flex-col gap-4">
              <div className="h-6 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="flex justify-between mt-2">
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse"></div>
                <div className="h-5 w-24 bg-gray-100 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
