"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Child } from "@/types/database";

const supabase = createClient();

// Fetch all children for current user
export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Child[];
    },
  });
}

// Add a new child
export function useAddChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (child: {
      name: string;
      class_info?: string;
      birthday?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("children")
        .insert({
          parent_id: user.id,
          name: child.name,
          class_info: child.class_info || null,
          birthday: child.birthday || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

// Update a child
export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      class_info?: string;
      birthday?: string;
    }) => {
      const { data, error } = await supabase
        .from("children")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

// Delete a child
export function useDeleteChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("children").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}
