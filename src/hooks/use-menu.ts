"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { MenuItem } from "@/types/database";

const supabase = createClient();

// Fetch all menu items
export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as MenuItem[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Group menu items by category
export function useGroupedMenuItems() {
  const { data: menuItems, ...rest } = useMenuItems();

  const grouped = menuItems?.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return { data: grouped, menuItems, ...rest };
}
