import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente Supabase com configuração de persistência de sessão
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
  },
});

// Tipos para o banco de dados
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  available: boolean;
  restaurant_id?: string | null; // ID do restaurante (UUID ou null)
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  order: number;
  created_at: string;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  name: string;
  price_modifier: number;
  display_order: number;
  available: boolean;
  created_at: string;
}

export interface SelectedOption {
  option_id: string;
  option_value_id: string;
  price_modifier: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  observations?: string;
  selectedOptions?: SelectedOption[];
  calculatedPrice?: number; // Preço total incluindo opções
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  total: number;
  delivery_address?: string;
  delivery_fee: number;
  payment_method: 'card' | 'pix' | 'cash';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  observations?: string;
}







