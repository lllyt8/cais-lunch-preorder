"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
// Types imported from database.ts as needed";

const supabase = createClient();

// Fetch all orders for current user
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          children (*),
          order_details (
            *,
            menu_items (*)
          )
        `
        )
        .eq("parent_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Create a new order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      childId: string;
      orderDate: string;
      items: Array<{
        menu_item_id: string;
        quantity: number;
        portion_type: string;
        unit_price: number;
      }>;
      specialRequests?: string;
    }) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Check for missing orders in a week
export function useCheckMissingOrders() {
  return useMutation({
    mutationFn: async ({
      childId,
      weekDates,
    }: {
      childId: string;
      weekDates: string[];
    }) => {
      const response = await fetch("/api/check-missing-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, weekDates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to check orders");
      }

      return response.json();
    },
  });
}
