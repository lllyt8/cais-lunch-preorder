-- Migration: Add User Roles and Admin Permissions
-- Created: 2025-12-07
-- Description: Adds role-based access control for admin functionality

-- Step 1: Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'parent';

-- Step 2: Add comment to explain role values
COMMENT ON COLUMN users.role IS 'User role: parent | restaurant_staff | admin | super_admin';

-- Step 3: Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 4: RLS Policy - Admins can manage all menu items
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;
CREATE POLICY "Admins can manage menu items" 
ON menu_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'restaurant_staff')
  )
);

-- Step 5: RLS Policy - Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" 
ON orders 
FOR SELECT 
USING (
  auth.uid() = parent_id  -- Parents see their own orders
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'restaurant_staff')
  )
);

-- Step 6: RLS Policy - Admins can update order status
DROP POLICY IF EXISTS "Admins can update order status" ON orders;
CREATE POLICY "Admins can update order status" 
ON orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'restaurant_staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'restaurant_staff')
  )
);

-- Step 7: RLS Policy - Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" 
ON users 
FOR SELECT 
USING (
  auth.uid() = id  -- Users can view themselves
  OR 
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Verification queries (run these after migration to check)
-- SELECT id, email, role FROM users LIMIT 5;
-- SELECT * FROM pg_policies WHERE tablename IN ('menu_items', 'orders', 'users');
