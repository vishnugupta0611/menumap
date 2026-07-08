import { create } from "zustand";

export const useOrderStore = create((set) => ({
  orders: [
    { id: "ORD-2041", table: "QR Guest", items: 3, total: 760, status: "New" },
    { id: "ORD-2040", table: "Table 5", items: 2, total: 540, status: "Preparing" },
  ],
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateStatus: (id, status) =>
    set((state) => ({ orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order)) })),
}));
