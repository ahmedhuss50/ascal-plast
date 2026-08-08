export type UserRole = "owner" | "manager" | "order_desk" | "production" | "rep";
export type OrderStatus =
  | "draft" | "confirmed" | "in_production" | "ready" | "delivered" | "cancelled";
export type OrderSource = "whatsapp" | "rep" | "manual";
export type StockDirection = "out" | "return";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  area: string | null;
  monthly_target: number | null;
  active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  area: string | null;
  lat: number | null;
  lng: number | null;
  price_tier: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string | null;
  name_ar: string;
  name_en: string;
  unit: string;
  price: number;
  photo_url: string | null;
  active: boolean;
  created_at: string;
}

export interface RawMaterial {
  id: string;
  name_ar: string;
  name_en: string;
  unit: string;
  stock_qty: number;
  reorder_level: number;
  created_at: string;
}

export interface Visit {
  id: string;
  rep_id: string;
  customer_id: string;
  visited_at: string;
  lat: number | null;
  lng: number | null;
  outcome: string | null;
  notes: string | null;
}

export interface Order {
  id: string;
  customer_id: string;
  rep_id: string | null;
  source: OrderSource;
  status: OrderStatus;
  notes: string | null;
  total: number;
  created_by: string | null;
  confirmed_by: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
}

export interface ProductionJob {
  id: string;
  order_id: string;
  status: OrderStatus;
  planned_date: string | null;
  produced_qty: number;
  created_at: string;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "draft", "confirmed", "in_production", "ready", "delivered",
];
