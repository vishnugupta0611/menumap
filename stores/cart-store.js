import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      customerInfo: null, // { name: "", email: "", phone: "" }
      cart: [], // { menuItemId, name, quantity, price, image }
      
      restaurantId: null,
      
      setCustomerInfo: (info) => set({ customerInfo: info }),
      
      addItem: (item) => {
        set((state) => {
          // If cart belongs to a different restaurant, clear it first
          if (state.cart.length > 0 && state.restaurantId && state.restaurantId !== item.restaurantId) {
            return {
              restaurantId: item.restaurantId,
              cart: [
                {
                  menuItemId: item.id || item._id, // Handle both id formats
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  quantity: 1,
                },
              ],
            };
          }

          const existing = state.cart.find((i) => i.menuItemId === (item.id || item._id));
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.menuItemId === (item.id || item._id) ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            restaurantId: item.restaurantId || state.restaurantId,
            cart: [
              ...state.cart,
              {
                menuItemId: item.id || item._id,
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

      clearCart: () => set({ cart: [], restaurantId: null }),

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
