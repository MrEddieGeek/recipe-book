import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim();
  return createClient(url, key);
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export class CategoryService {
  static async getAll(): Promise<Category[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  }

  static async create(name: string, color: string, icon: string): Promise<Category> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, color, icon })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Error al crear categoría: ${error?.message}`);
    }
    return data;
  }
}
