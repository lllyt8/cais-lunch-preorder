"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { useWeekSelector } from "@/hooks/use-week-selector";
import { toast } from "sonner";
import { format, parseISO, startOfWeek, addDays } from "date-fns";
import type { MenuItem } from "@/types/database";

interface LastOrderItem {
  menu_item_id: string;
  quantity: number;
  portion_type: string;
  unit_price_at_time_of_order: number;
  menu_items: MenuItem;
}

interface LastWeekOrder {
  id: string;
  child_id: string;
  order_date: string;
  children: {
    id: string;
    name: string;
  };
  order_details: LastOrderItem[];
}

export function useReorder() {
  const [loading, setLoading] = useState(false);
  const [lastWeekOrders, setLastWeekOrders] = useState<LastWeekOrder[]>([]);
  const supabase = createClient();
  const { addItem } = useCart();
  const { getCurrentWeek } = useWeekSelector();

  // Fetch last week's paid orders
  const fetchLastWeekOrders = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all paid orders, ordered by date descending
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          child_id,
          order_date,
          children (id, name),
          order_details (
            menu_item_id,
            quantity,
            portion_type,
            unit_price_at_time_of_order,
            menu_items (*)
          )
        `
        )
        .eq("parent_id", user.id)
        .eq("status", "paid")
        .order("order_date", { ascending: false })
        .limit(20); // Get recent orders

      if (error) throw error;

      if (!data || data.length === 0) {
        setLastWeekOrders([]);
        return [];
      }

      // Group by week and get the most recent full week
      const ordersByWeek = new Map<string, LastWeekOrder[]>();

      data.forEach((order: any) => {
        const orderDate = parseISO(order.order_date);
        const weekStart = startOfWeek(orderDate, { weekStartsOn: 1 });
        const weekKey = format(weekStart, 'yyyy-MM-dd');

        if (!ordersByWeek.has(weekKey)) {
          ordersByWeek.set(weekKey, []);
        }
        ordersByWeek.get(weekKey)!.push(order as LastWeekOrder);
      });

      // Get the most recent week's orders
      const weeks = Array.from(ordersByWeek.keys()).sort().reverse();
      if (weeks.length > 0) {
        const mostRecentWeekOrders = ordersByWeek.get(weeks[0]) || [];
        setLastWeekOrders(mostRecentWeekOrders);
        return mostRecentWeekOrders;
      }

      setLastWeekOrders([]);
      return [];
    } catch (error) {
      console.error("Error fetching last week orders:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Reorder last week's orders to next week
  const reorderWeekToCart = async () => {
    setLoading(true);
    try {
      let orders = lastWeekOrders;
      if (!orders || orders.length === 0) {
        orders = await fetchLastWeekOrders();
      }

      if (!orders || orders.length === 0) {
        toast.error("No previous week orders found");
        return false;
      }

      const currentWeek = getCurrentWeek();
      const nextWeekStart = currentWeek.weekDays[0];

      let itemsAdded = 0;
      const childrenNames = new Set<string>();

      // Add each order from last week to the corresponding day in next week
      for (const order of orders) {
        const orderDate = parseISO(order.order_date);
        const orderDayOfWeek = (orderDate.getDay() + 6) % 7; // Convert to Monday=0

        // Map to next week's corresponding day
        const targetDate = format(
          addDays(nextWeekStart, orderDayOfWeek),
          "yyyy-MM-dd"
        );

        childrenNames.add(order.children?.name || "");

        // Add each item to cart
        for (const detail of order.order_details) {
          if (detail.menu_items) {
            const portionType =
              detail.portion_type === "half" ? "Half Order" : "Full Order";
            addItem(
              order.child_id,
              targetDate,
              detail.menu_items,
              portionType as "Full Order" | "Half Order",
              detail.unit_price_at_time_of_order || detail.menu_items.base_price
            );
            itemsAdded++;
          }
        }
      }

      const childrenList = Array.from(childrenNames).filter(Boolean).join(", ");

      toast.success(`Reordered last week for ${childrenList}`, {
        description: `${itemsAdded} items added for week of ${currentWeek.shortLabel}`,
        action: {
          label: "View Cart",
          onClick: () => (window.location.href = "/dashboard/cart"),
        },
      });

      return true;
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    lastWeekOrders,
    fetchLastWeekOrders,
    reorderWeekToCart,
  };
}
