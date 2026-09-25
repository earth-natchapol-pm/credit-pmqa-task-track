import { initialProducts } from './data.js';
import { hasSupabaseConfig, supabase } from '../lib/supabase.js';

const mapProduct = product => ({ id: product.id, name: product.name, acronym: product.acronym });

export async function listProducts() {
  if (!hasSupabaseConfig) return initialProducts;
  const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function createProduct(product) {
  if (!hasSupabaseConfig) return product;
  const { data, error } = await supabase.from('products').insert({ name: product.name, acronym: product.acronym }).select().single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(product) {
  if (!hasSupabaseConfig) return product;
  const { data, error } = await supabase.from('products').update({ name: product.name, acronym: product.acronym }).eq('id', product.id).select().single();
  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(product) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.from('products').delete().eq('id', product.id);
  if (error) throw error;
}
