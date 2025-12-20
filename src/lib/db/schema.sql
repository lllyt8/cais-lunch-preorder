-- CAIS Lunch Preorder System - Database Schema
-- Run this in Supabase SQL Editor

-- 1. 用户表 (Users): 家长信息
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT
);

-- 2. 孩子表 (Children): 关联到家长
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    class_color TEXT NOT NULL,
    birthday DATE,
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_grade_level CHECK (grade_level IN ('Preschool', 'Kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')),
    CONSTRAINT check_class_color CHECK (class_color IN ('Red', 'Gold', 'Green', 'Orange', 'Purple', 'Blue'))
);

-- 3. 菜单项表 (MenuItems): 存储所有可选项
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL,
    category TEXT,
    is_full_order_only BOOLEAN DEFAULT FALSE,
    has_tofu_option BOOLEAN DEFAULT FALSE
);

-- 4. 订单表 (Orders): 核心交易记录
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) NOT NULL,
    child_id UUID REFERENCES children(id) NOT NULL,
    order_date DATE NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending_payment',
    fulfillment_status TEXT DEFAULT 'pending_delivery',
    special_requests TEXT,
    stripe_payment_intent_id TEXT,  -- 🔗 Stripe 交易引用 ID (Financial Linkage)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 订单详情表 (OrderDetails): 订单包含的菜品
CREATE TABLE order_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    quantity INTEGER NOT NULL,
    portion_type TEXT NOT NULL,
    unit_price_at_time_of_order NUMERIC NOT NULL  -- 💰 锁定价格 (Financial Integrity)
);

-- 6. 收藏/模板表 (Favorites): 用于"一键复购"
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) NOT NULL,
    template_name TEXT NOT NULL,
    order_details JSONB
);

-- 7. 临时 checkout session 数据表
CREATE TABLE checkout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    orders_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Menu items are public read
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Menu items are viewable by everyone" ON menu_items FOR SELECT USING (true);

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Parents can view own children" ON children FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own children" ON children FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete own children" ON children FOR DELETE USING (auth.uid() = parent_id);

-- RLS Policies for orders
CREATE POLICY "Parents can view own orders" ON orders FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own orders" ON orders FOR UPDATE USING (auth.uid() = parent_id);

-- RLS Policies for order_details
CREATE POLICY "View order details for own orders" ON order_details FOR SELECT 
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_details.order_id AND orders.parent_id = auth.uid()));
CREATE POLICY "Insert order details for own orders" ON order_details FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_details.order_id AND orders.parent_id = auth.uid()));

-- RLS Policies for favorites
CREATE POLICY "Parents can view own favorites" ON favorites FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own favorites" ON favorites FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = parent_id);

-- RLS Policies for checkout_sessions
CREATE POLICY "Users can view own checkout sessions" ON checkout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkout sessions" ON checkout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkout sessions" ON checkout_sessions FOR DELETE USING (auth.uid() = user_id);

-- Indexes for checkout_sessions
CREATE INDEX idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample menu items
INSERT INTO menu_items (name, description, base_price, category, is_full_order_only, has_tofu_option) VALUES
('Chicken Teriyaki Bento', 'Grilled chicken with teriyaki sauce, rice, and vegetables', 12.00, 'Bento Box', false, true),
('Beef Bulgogi Bento', 'Korean-style marinated beef with rice and kimchi', 13.50, 'Bento Box', false, false),
('Vegetable Tempura Bento', 'Assorted vegetable tempura with rice and miso soup', 11.00, 'Bento Box', true, false),
('Steamed Dumplings', 'Pork and vegetable dumplings', 13.00, 'Dumplings', false, true),
('Fried Rice', 'Egg fried rice with vegetables', 8.00, 'Rice', false, false),
('Miso Soup', 'Traditional Japanese miso soup with tofu', 3.50, 'Soup', true, false),
('Edamame', 'Steamed soybeans with sea salt', 4.00, 'Snacks', true, false),
('Chicken Noodle Soup', 'Hearty chicken noodle soup', 9.00, 'Noodles', false, false),
('Veggie Spring Rolls', 'Crispy vegetable spring rolls (4 pcs)', 6.00, 'Snacks', true, false),
('Fruit Cup', 'Fresh seasonal fruits', 4.50, 'Snacks', true, false);
