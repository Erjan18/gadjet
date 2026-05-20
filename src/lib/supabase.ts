import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  category_id: string | null;
  image_url: string;
  images: string[];
  brand: string;
  stock: number;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_new: boolean;
  specs: Record<string, string>;
  created_at: string;
  updated_at: string;
  categories?: Category;
};

export type Order = {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  created_at: string;
};
