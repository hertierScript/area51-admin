// Database types for the restaurant admin dashboard

export interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  name: string
  role_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  role?: Role
}

export interface Customer {
  id: string
  email: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  type: 'food' | 'drinks'
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: string
  customer_id: string | null
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  notes: string | null
  delivery_address: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  quantity: number
  unit_price: number
  total_price: number
  special_instructions: string | null
  created_at: string
  menu_item?: MenuItem
}

export interface Promotion {
  id: string
  name: string
  description: string | null
  type: 'percentage' | 'fixed' | 'bogo'
  value: number
  min_order_amount: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  promotion_items?: PromotionItem[]
}

export interface PromotionItem {
  id: string
  promotion_id: string
  menu_item_id: string
  created_at: string
  menu_item?: MenuItem
}

export interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  link_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Auth context type
export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role | null
}

// Dashboard stats type
export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  activePromotions: number
  totalMenuItems: number
  totalCustomers: number
}
