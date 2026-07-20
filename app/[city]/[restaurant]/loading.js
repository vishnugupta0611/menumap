export default function Loading() {
  return (
    <div className="pb-20">
      {/* Hero Skeleton */}
      <section className="mb-8 max-w-4xl mx-auto px-margin-mobile pt-4">
        <div className="relative w-full h-64 md:h-80 rounded-[32px] overflow-hidden bg-surface-container-highest animate-pulse">
          <div className="absolute inset-0 flex flex-col justify-end pb-6 md:pb-8 px-6 md:px-8">
            <div className="w-2/3 md:w-1/2 h-10 md:h-14 bg-white/20 rounded-xl mb-3 backdrop-blur-sm"></div>
            <div className="w-1/3 h-5 md:h-6 bg-white/20 rounded-lg mb-6 backdrop-blur-sm"></div>
            <div className="flex gap-3">
              <div className="w-24 h-7 md:h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
              <div className="w-24 h-7 md:h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Skeleton */}
      <div className="px-margin-mobile mb-12 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-14 bg-surface-container-highest rounded-2xl animate-pulse"></div>
          <div className="w-full sm:w-40 h-14 bg-surface-container-highest rounded-2xl animate-pulse"></div>
        </div>
      </div>

      {/* Popular Picks Skeleton */}
      <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="w-48 h-8 md:h-10 bg-surface-container-highest rounded-lg mb-2 animate-pulse"></div>
            <div className="w-64 h-4 bg-surface-container-highest rounded-full animate-pulse"></div>
          </div>
          <div className="hidden sm:block w-24 h-8 bg-surface-container-highest rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="rounded-[24px] w-40 sm:w-44 md:w-52 shrink-0 aspect-[4/5] bg-surface-container-highest animate-pulse relative"
            >
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-3 w-1/2 bg-white/20 rounded-full mb-2"></div>
                <div className="h-4 w-3/4 bg-white/20 rounded-lg mb-3"></div>
                <div className="h-6 w-16 bg-white/20 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info & Contact Skeleton */}
      <section className="px-margin-mobile mb-16 max-w-4xl mx-auto">
        <div className="w-48 h-8 md:h-10 bg-surface-container-highest rounded-lg mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-surface-container-highest rounded-[32px] animate-pulse"></div>
          <div className="h-64 bg-surface-container-highest rounded-[32px] animate-pulse"></div>
        </div>
      </section>
    </div>
  );
}
