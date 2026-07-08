import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      customerInfo: null, // { name: "", email: "", phone: "" }
      cart: [], // { menuItemId, name, quantity, price, image }
      
      setCustomerInfo: (info) => set({ customerInfo: info }),
      
      addItem: (item) => {
        set((state) => {
          const existing = state.cart.find((i) => i.menuItemId === item.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1,
              },
            ],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const existing = state.cart.find((i) => i.menuItemId === itemId);
          if (existing?.quantity > 1) {
            return {
              cart: state.cart.map((i) =>
                i.menuItemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
              ),
            };
          }
          return { cart: state.cart.filter((i) => i.menuItemId !== itemId) };
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotalAmount: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      
      getTotalItems: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "customer-cart-storage",
    }
  )
);
