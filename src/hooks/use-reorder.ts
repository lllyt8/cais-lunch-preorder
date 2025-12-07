"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { useWeekSelector } from "@/hooks/use-week-selector";
import { toast } from "sonner";
import { format } from "date-fns";
import type { MenuItem } from "@/types/database";

interface LastOrderItem {
  menu_item_id: string;
  quantity: number;
  portion_type: string;
  unit_price_at_time_of_order: number;
  menu_items: MenuItem;
}

interface LastOrder {
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
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const supabase = createClient();
  const { addItem, setSelectedChild, setSelectedDate } = useCart();
  const { getCurrentWeek } = useWeekSelector();

  const fetchLastOrder = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

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
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) throw error;

      if (!data) {
        // No previous orders - this is normal for new users
        setLastOrder(null);
        return null;
      }

      setLastOrder(data as unknown as LastOrder);
      return data as unknown as LastOrder;
    } catch (error) {
      // Only log actual errors, not "no rows" which is expected
      console.error("Error fetching last order:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reorderToCart = async () => {
    setLoading(true);
    try {
      let order = lastOrder;
      if (!order) {
        order = await fetchLastOrder();
      }

      if (!order || !order.order_details?.length) {
        toast.error("No previous order found");
        return false;
      }

      const currentWeek = getCurrentWeek();
      const targetDate = format(currentWeek.weekDays[0], "yyyy-MM-dd");

      // Set the child and date
      if (order.children) {
        setSelectedChild(order.child_id);
      }
      setSelectedDate(targetDate);

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
        }
      }

      toast.success(
        `Added previous order for ${order.children?.name || "your child"}`,
        {
          description: `Week of ${currentWeek.shortLabel}. Please review dates.`,
          action: {
            label: "View Cart",
            onClick: () => (window.location.href = "/dashboard/cart"),
          },
        }
      );

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
    lastOrder,
    fetchLastOrder,
    reorderToCart,
  };
}
