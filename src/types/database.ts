export interface User {
  id: string;
  email: string;
  name?: string;
  phone_number?: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  class_info?: string;
  birthday?: string;
  profile_photo_url?: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  half_order_price?: number; // 半份价格，如果为null则不支持半份
  category?: string;
  is_full_order_only: boolean;
  has_tofu_option: boolean;
  available_date?: string; // ISO date string (YYYY-MM-DD) for when this menu item is available

  // Image and dietary information
  image_url?: string;
  is_vegetarian?: boolean;
  contains_soy?: boolean;
  contains_gluten?: boolean;
  contains_fish?: boolean;
  contains_eggs?: boolean;
}

export interface Order {
  id: string;
  parent_id: string;
  child_id: string;
  order_date: string;
  total_amount: number;
  status: "pending_payment" | "paid" | "cancelled";
  fulfillment_status: "pending_delivery" | "delivered";
  special_requests?: string;
  created_at: string;
}

export interface OrderDetail {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  portion_type: "Full Order" | "Half Order";
}

export interface Favorite {
  id: string;
  parent_id: string;
  template_name: string;
  order_details: Record<string, unknown>;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  portion_type: "Full Order" | "Half Order";
  unit_price: number;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id">;
        Update: Partial<User>;
      };
      children: {
        Row: Child;
        Insert: Omit<Child, "id" | "created_at">;
        Update: Partial<Omit<Child, "id" | "created_at">>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, "id">;
        Update: Partial<Omit<MenuItem, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<
          Order,
          "id" | "created_at" | "status" | "fulfillment_status"
        >;
        Update: Partial<Omit<Order, "id" | "created_at">>;
      };
      order_details: {
        Row: OrderDetail;
        Insert: Omit<OrderDetail, "id">;
        Update: Partial<Omit<OrderDetail, "id">>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id">;
        Update: Partial<Omit<Favorite, "id">>;
      };
    };
  };
}
