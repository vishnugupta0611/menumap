export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="h-6 w-32 bg-surface-container-high rounded-full mb-2"></div>
          <div className="h-10 sm:h-12 w-64 sm:w-96 bg-surface-container-high rounded-lg"></div>
        </div>
        
        {/* Filter Badges Skeleton */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-24 bg-surface-container-high rounded-full border border-outline-variant/30"></div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="w-full lg:w-64 shrink-0 space-y-6 hidden md:block">
          {[1, 2, 3].map(section => (
            <div key={section} className="pb-6 border-b border-outline-variant/30">
              <div className="h-6 w-3/4 bg-surface-container-high rounded-md mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-surface-container-high"></div>
                    <div className="h-4 w-2/3 bg-surface-container-high rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results Grid Skeleton */}
        <div className="flex-1 space-y-8">
          {/* Restaurant Results */}
          <div>
            <div className="h-8 w-48 bg-surface-container-high rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden shadow-sm">
                  <div className="h-40 w-full bg-surface-container-high"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 w-3/4 bg-surface-container-high rounded-md"></div>
                    <div className="flex gap-2">
                      <div className="h-4 w-1/3 bg-surface-container-high rounded-full"></div>
                      <div className="h-4 w-1/4 bg-surface-container-high rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
