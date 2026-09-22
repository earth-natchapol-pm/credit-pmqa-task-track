import { initialFeatures } from './data.js';
import { hasSupabaseConfig, supabase } from '../lib/supabase.js';

const mapFeature = feature => ({
  id: feature.id,
  name: feature.name,
  product: feature.product,
  priority: feature.priority,
  pmPicId: feature.pm_pic_id,
  qaPicId: feature.qa_pic_id,
  uatStart: feature.uat_start,
  uatEnd: feature.uat_end,
  uatStatus: feature.uat_status,
  uatSignedOff: feature.uat_signed_off || '',
  liveStart: feature.live_start,
  liveEnd: feature.live_end,
  liveStatus: feature.live_status,
  liveSignedOff: feature.live_signed_off || '',
  status: feature.status,
});

export async function listFeatures() {
  if (!hasSupabaseConfig) return initialFeatures;
  const { data, error } = await supabase.from('features').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapFeature);
}

const toRow = feature => ({
  name: feature.name, product: feature.product, priority: feature.priority, pm_pic_id: feature.pmPicId || null, qa_pic_id: feature.qaPicId || null,
  uat_start: feature.uatStart || null, uat_end: feature.uatEnd || null, uat_status: feature.uatStatus, uat_signed_off: feature.uatSignedOff || null,
  live_start: feature.liveStart || null, live_end: feature.liveEnd || null, live_status: feature.liveStatus, live_signed_off: feature.liveSignedOff || null, status: feature.status,
});

export async function createFeature(feature) {
  if (!hasSupabaseConfig) return feature;
  const { data, error } = await supabase.from('features').insert(toRow(feature)).select().single();
  if (error) throw error;
  return mapFeature(data);
}

export async function updateFeature(feature) {
  if (!hasSupabaseConfig) return feature;
  const { data, error } = await supabase.from('features').update(toRow(feature)).eq('id', feature.id).select().single();
  if (error) throw error;
  return mapFeature(data);
}

export async function deleteFeature(feature) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.from('features').delete().eq('id', feature.id);
  if (error) throw error;
}
