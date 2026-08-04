import { create } from 'zustand';

export const useGlobalStore = create((set) => ({
  // --- Homepage State ---
  homeDataLoaded: false,
  galleryLoaded: false,
  nearbyRestaurants: [],
  trendingDishes: [],
  recommendedDishes: [],
  galleryPhotos: [],
  
  setHomeData: (data) => set({
    nearbyRestaurants: data.nearbyRestaurants,
    trendingDishes: data.trendingDishes,
    recommendedDishes: data.recommendedDishes,
    homeDataLoaded: true,
  }),
  
  setGalleryData: (photos) => set({
    galleryPhotos: photos,
    galleryLoaded: true,
  }),
  
  // --- Search Page State ---
  searchPageLoaded: false,
  searchActiveTab: "All",
  searchCachedQuery: "",
  searchCachedFilter: "All",
  searchAllDishes: [],
  searchTrendingDishes: [],
  searchPage: 1,
  searchHasMore: false,
  
  setSearchActiveTab: (tab) => set({ searchActiveTab: tab }),
  
  setSearchAllInitial: (dishes, hasMore, query, filter) => set({
    searchAllDishes: dishes,
    searchPage: 1,
    searchHasMore: hasMore,
    searchCachedQuery: query,
    searchCachedFilter: filter,
    searchPageLoaded: true
  }),
  
  appendSearchAll: (dishes, hasMore, newPage) => set((state) => ({
    searchAllDishes: [...state.searchAllDishes, ...dishes],
    searchHasMore: hasMore,
    searchPage: newPage
  })),

  setSearchTrending: (dishes) => set({
    searchTrendingDishes: dishes
  })
}));
