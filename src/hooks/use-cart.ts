"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, CartItem } from "@/types/database";

interface CartState {
  items: Record<string, CartItem[]>; // keyed by `${childId}-${date}`
  selectedChildId: string | null;
  selectedDate: string; // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'

  setSelectedChild: (childId: string | null) => void;
  setSelectedDate: (date: string) => void;

  addItem: (
    childId: string,
    date: string,
    menuItem: MenuItem,
    portionType: "Full Order" | "Half Order",
    price: number
  ) => void;
  removeItem: (
    childId: string,
    date: string,
    menuItemId: string,
    portionType?: string
  ) => void;
  updateQuantity: (
    childId: string,
    date: string,
    menuItemId: string,
    quantity: number,
    portionType?: string
  ) => void;
  clearCart: (childId: string, date: string) => void;
  clearAllCarts: () => void;

  getCartItems: (childId: string, date: string) => CartItem[];
  getCartTotal: (childId: string, date: string) => number;
  getTotalItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      selectedChildId: null,
      selectedDate: "Mon",

      setSelectedChild: (childId) => set({ selectedChildId: childId }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      addItem: (childId, date, menuItem, portionType, price) => {
        const key = `${childId}-${date}`;
        const currentItems = get().items[key] || [];

        const existingIndex = currentItems.findIndex(
          (item) =>
            item.menu_item.id === menuItem.id &&
            item.portion_type === portionType
        );

        if (existingIndex >= 0) {
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          set({ items: { ...get().items, [key]: updated } });
        } else {
          set({
            items: {
              ...get().items,
              [key]: [
                ...currentItems,
                {
                  menu_item: menuItem,
                  quantity: 1,
                  portion_type: portionType,
                  unit_price: price,
                },
              ],
            },
          });
        }
      },

      removeItem: (childId, date, menuItemId, portionType) => {
        const key = `${childId}-${date}`;
        const currentItems = get().items[key] || [];
        set({
          items: {
            ...get().items,
            [key]: currentItems.filter((item) =>
              portionType
                ? !(
                    item.menu_item.id === menuItemId &&
                    item.portion_type === portionType
                  )
                : item.menu_item.id !== menuItemId
            ),
          },
        });
      },

      updateQuantity: (childId, date, menuItemId, quantity, portionType) => {
        const key = `${childId}-${date}`;
        const currentItems = get().items[key] || [];

        if (quantity <= 0) {
          set({
            items: {
              ...get().items,
              [key]: currentItems.filter((item) =>
                portionType
                  ? !(
                      item.menu_item.id === menuItemId &&
                      item.portion_type === portionType
                    )
                  : item.menu_item.id !== menuItemId
              ),
            },
          });
        } else {
          set({
            items: {
              ...get().items,
              [key]: currentItems.map((item) =>
                (
                  portionType
                    ? item.menu_item.id === menuItemId &&
                      item.portion_type === portionType
                    : item.menu_item.id === menuItemId
                )
                  ? { ...item, quantity }
                  : item
              ),
            },
          });
        }
      },

      clearCart: (childId, date) => {
        const key = `${childId}-${date}`;
        const newItems = { ...get().items };
        delete newItems[key];
        set({ items: newItems });
      },

      clearAllCarts: () => set({ items: {} }),

      getCartItems: (childId, date) => {
        const key = `${childId}-${date}`;
        return get().items[key] || [];
      },

      getCartTotal: (childId, date) => {
        const key = `${childId}-${date}`;
        const items = get().items[key] || [];
        return items.reduce(
          (total, item) => total + item.unit_price * item.quantity,
          0
        );
      },

      getTotalItemCount: () => {
        const items = get().items;
        return Object.values(items).reduce(
          (total, cartItems) =>
            total + cartItems.reduce((sum, item) => sum + item.quantity, 0),
          0
        );
      },
    }),
    {
      name: "cais-cart-storage",
    }
  )
);
