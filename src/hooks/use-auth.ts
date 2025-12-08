"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * User role types
 * - parent: Regular parent user (default)
 * - restaurant_staff: Can manage menu and view orders
 * - admin: Full admin access
 * - super_admin: Reserved for future use
 */
export type UserRole = "parent" | "restaurant_staff" | "admin" | "super_admin";

/**
 * Extended user type with role information
 */
export interface AuthUser extends User {
  role?: UserRole;
}

/**
 * Authentication and authorization hook
 *
 * @example
 * ```tsx
 * const { user, isAdmin, loading } = useAuth()
 *
 * if (loading) return <Spinner />
 * if (!isAdmin) return <Redirect to="/dashboard" />
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch user and their role
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Query user's role from database
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", authUser.id)
          .single();

        setUser({
          ...authUser,
          role: (userData?.role as UserRole) || "parent",
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getUser();

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Computed permission flags
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isStaff = user?.role === "restaurant_staff" || isAdmin;
  const isParent = user?.role === "parent";

  return {
    /** Current authenticated user with role */
    user,
    /** Loading state */
    loading,
    /** Whether user is authenticated */
    isAuthenticated: !!user,
    /** Whether user is admin (admin or super_admin) */
    isAdmin,
    /** Whether user is staff (restaurant_staff, admin, or super_admin) */
    isStaff,
    /** Whether user is parent */
    isParent,
    /** User's role */
    role: user?.role,
  };
}
