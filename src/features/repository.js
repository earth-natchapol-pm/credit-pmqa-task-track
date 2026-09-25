import { initialFeatures } from './data.js';
import { hasSupabaseConfig, supabase } from '../lib/supabase.js';

const mapFeature = feature => ({
  id: feature.id,
  name: feature.name,
  description: feature.description || '',
  prdDocuments: (feature.feature_prd_documents || []).map(document => ({ id: document.id, name: document.name || 'PRD', url: document.url })),
  product: feature.product,
  productIds: (feature.feature_products || []).map(item => item.product_id || item.product?.id).filter(Boolean),
  productNames: (feature.feature_products || []).map(item => item.product?.name).filter(Boolean),
  productAcronyms: (feature.feature_products || []).map(item => item.product?.acronym || item.product?.name).filter(Boolean),
  priority: feature.priority,
  pmPicId: feature.pm_pic_id,
  qaPicId: feature.qa_pic_id,
  pmPicIds: Array.isArray(feature.pm_pic_ids) ? feature.pm_pic_ids : feature.pm_pic_id ? [feature.pm_pic_id] : [],
  qaPicIds: Array.isArray(feature.qa_pic_ids) ? feature.qa_pic_ids : feature.qa_pic_id ? [feature.qa_pic_id] : [],
  uatStart: feature.uat_start,
  uatEnd: feature.uat_end,
  uatStatus: feature.uat_status,
  uatSignedOff: feature.uat_signed_off || '',
  uatTestCaseUrl: feature.uat_test_case_url || '',
  uatTestResultUrl: feature.uat_test_result_url || '',
  liveStart: feature.live_start,
  liveEnd: feature.live_end,
  liveStatus: feature.live_status,
  liveSignedOff: feature.live_signed_off || '',
  liveTestCaseUrl: feature.live_test_case_url || '',
  liveTestResultUrl: feature.live_test_result_url || '',
  status: feature.status,
  subtasks: Array.isArray(feature.subtasks) ? feature.subtasks : [],
});

export async function listFeatures() {
  if (!hasSupabaseConfig) return initialFeatures;
  const { data, error } = await supabase.from('features').select('*, feature_prd_documents(id, name, url), feature_products(product_id, product:products(id, name, acronym))').order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapFeature);
}

const toRow = feature => ({
  name: feature.name, description: feature.description || null, product: feature.product, priority: feature.priority, pm_pic_id: feature.pmPicIds?.[0] || feature.pmPicId || null, qa_pic_id: feature.qaPicIds?.[0] || feature.qaPicId || null, pm_pic_ids: feature.pmPicIds || [], qa_pic_ids: feature.qaPicIds || [],
  uat_start: feature.uatStart || null, uat_end: feature.uatEnd || null, uat_status: feature.uatStatus, uat_signed_off: feature.uatSignedOff || null,
  uat_test_case_url: feature.uatTestCaseUrl || null, uat_test_result_url: feature.uatTestResultUrl || null,
  live_start: feature.liveStart || null, live_end: feature.liveEnd || null, live_status: feature.liveStatus, live_signed_off: feature.liveSignedOff || null,
  live_test_case_url: feature.liveTestCaseUrl || null, live_test_result_url: feature.liveTestResultUrl || null, status: feature.status,
  subtasks: Array.isArray(feature.subtasks) ? feature.subtasks : [],
});

const savePrdDocuments = async (featureId, documents) => {
  const { error: deleteError } = await supabase.from('feature_prd_documents').delete().eq('feature_id', featureId);
  if (deleteError) throw deleteError;
  const rows = (documents || []).filter(document => document.url?.trim()).map(document => ({ feature_id: featureId, name: document.name?.trim() || 'PRD', url: document.url.trim() }));
  if (!rows.length) return [];
  const { error } = await supabase.from('feature_prd_documents').insert(rows);
  if (error) throw error;
  return rows;
};

const saveFeatureProducts = async (featureId, productIds) => {
  const { error: deleteError } = await supabase.from('feature_products').delete().eq('feature_id', featureId);
  if (deleteError) throw deleteError;
  const rows = (productIds || []).filter(Boolean).map(productId => ({ feature_id: featureId, product_id: productId }));
  if (!rows.length) return [];
  const { data, error } = await supabase.from('feature_products').insert(rows).select('product_id, product:products(id, name, acronym)');
  if (error) throw error;
  return data;
};

export async function createFeature(feature) {
  if (!hasSupabaseConfig) return feature;
  const { data, error } = await supabase.from('features').insert(toRow(feature)).select().single();
  if (error) throw error;
  const documents = await savePrdDocuments(data.id, feature.prdDocuments);
  const featureProducts = await saveFeatureProducts(data.id, feature.productIds);
  return mapFeature({ ...data, feature_prd_documents: documents, feature_products: featureProducts });
}

export async function updateFeature(feature) {
  if (!hasSupabaseConfig) return feature;
  const { data, error } = await supabase.from('features').update(toRow(feature)).eq('id', feature.id).select().single();
  if (error) throw error;
  const documents = await savePrdDocuments(data.id, feature.prdDocuments);
  const featureProducts = await saveFeatureProducts(data.id, feature.productIds);
  return mapFeature({ ...data, feature_prd_documents: documents, feature_products: featureProducts });
}

export async function deleteFeature(feature) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.from('features').delete().eq('id', feature.id);
  if (error) throw error;
}
