import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

// Generate a URL-safe slug from a name
export const toItemId = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export const useLocalOrdersStore = create(
  persist(
    (set, get) => ({
      // pendingQueue: array of individual order entries
      // { localId, date, itemId, itemName, qty, price, status }
      pendingQueue: [],
      isSyncing: false,

      // Add a single order entry to the queue
      addLocalOrder: async (orderItem) => {
        const newItem = {
          ...orderItem,
          localId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        };

        set((state) => ({ pendingQueue: [...state.pendingQueue, newItem] }));

        // Auto-sync when 5 entries accumulate
        if (get().pendingQueue.length >= 5) {
          await get().syncToServer();
        }
      },

      // Remove a specific un-synced local entry
      removeLocalOrder: (localId) => {
        set((state) => ({
          pendingQueue: state.pendingQueue.filter((item) => item.localId !== localId),
        }));
      },

      // Update a local entry (e.g. change status before sync)
      updateLocalOrder: (localId, updates) => {
        set((state) => ({
          pendingQueue: state.pendingQueue.map((item) =>
            item.localId === localId ? { ...item, ...updates } : item
          ),
        }));
      },

      // Sync all queued entries to the server in batches grouped by date+itemId
      syncToServer: async () => {
        const { pendingQueue } = get();
        if (pendingQueue.length === 0) return true;

        set({ isSyncing: true });

        // Group by date, then by itemId
        // Result: { "2026-07-18": { "paneer-tikka": { itemName, orders: [] }, ... }, ... }
        const grouped = {};
        for (const entry of pendingQueue) {
          const { localId, date, itemId, itemName, qty, price, status } = entry;
          if (!grouped[date]) grouped[date] = {};
          if (!grouped[date][itemId]) grouped[date][itemId] = { itemName, orders: [] };
          grouped[date][itemId].orders.push({ qty, price, status });
        }

        // Build flat array for the sync API
        const syncItems = [];
        for (const [date, itemMap] of Object.entries(grouped)) {
          for (const [itemId, { itemName, orders }] of Object.entries(itemMap)) {
            syncItems.push({ date, itemId, itemName, orders });
          }
        }

        try {
          await api.post("/api/local-orders/sync", { items: syncItems });
          set({ pendingQueue: [], isSyncing: false });
          return true;
        } catch (error) {
          console.error("Failed to sync local orders", error);
          set({ isSyncing: false });
          return false;
        }
      },
    }),
    {
      name: "local-orders-queue-v2", // new key so old data doesn't conflict
    }
  )
);
