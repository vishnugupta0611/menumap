import { create } from 'zustand';

export const useGlobalStore = create((set) => ({
  // --- Homepage State ---
  homeDataLoaded: false,
  nearbyRestaurants: [],
  trendingDishes: [],
  recommendedDishes: [],
  
  setHomeData: (data) => set({
    nearbyRestaurants: data.nearbyRestaurants,
    trendingDishes: data.trendingDishes,
    recommendedDishes: data.recommendedDishes,
    homeDataLoaded: true,
  }),
  
  // --- Search Page State ---
  searchPageLoaded: false,
  searchActiveTab: "All",
  searchAllDishes: [],
  searchTrendingDishes: [],
  searchPage: 1,
  searchHasMore: false,
  
  setSearchActiveTab: (tab) => set({ searchActiveTab: tab }),
  
  setSearchAllInitial: (dishes, hasMore) => set({
    searchAllDishes: dishes,
    searchPage: 1,
    searchHasMore: hasMore,
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
