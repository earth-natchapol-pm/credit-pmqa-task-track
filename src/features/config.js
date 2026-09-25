export const priorities = ['P0', 'P1', 'P2', 'P3'];
export const products = ['Credit Platform', 'Applications', 'Servicing', 'Risk decisioning'];

export const uatStatuses = ['Not Started', 'In Progress', 'Done', 'On Hold'];
export const liveStatuses = ['Not Started', 'In Progress', 'Done', 'On Hold'];

const defaultMainStatuses = ['In Dev', 'In UAT', 'UAT Signed-off', 'System Live', 'Live Testing', 'Live Testing Signed-off', 'Greyscale', 'Lived'];
const defaultSubtaskStatuses = ['Not Started', 'In Progress', 'Done', 'On Hold'];
const STORAGE_KEY = 'credit-pmqa-feature-workflow';

const normalizeList = (values, fallback) => Array.from(new Set((Array.isArray(values) ? values : fallback).map(item => String(item).trim()).filter(Boolean))).slice(0, 50);
const toValueKey = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'status';
export const toStatusKey = toValueKey;

export function getFeatureWorkflowConfig() {
  if (typeof window === 'undefined') {
    return { mainStatuses: [...defaultMainStatuses], subtaskStatuses: [...defaultSubtaskStatuses] };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { mainStatuses: [...defaultMainStatuses], subtaskStatuses: [...defaultSubtaskStatuses] };
    }

    const parsed = JSON.parse(stored);
    return {
      mainStatuses: normalizeList(parsed?.mainStatuses, defaultMainStatuses),
      subtaskStatuses: normalizeList(parsed?.subtaskStatuses, defaultSubtaskStatuses),
    };
  } catch (error) {
    return { mainStatuses: [...defaultMainStatuses], subtaskStatuses: [...defaultSubtaskStatuses] };
  }
}

export function saveFeatureWorkflowConfig(nextConfig) {
  const config = {
    mainStatuses: normalizeList(nextConfig?.mainStatuses, defaultMainStatuses),
    subtaskStatuses: normalizeList(nextConfig?.subtaskStatuses, defaultSubtaskStatuses),
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  return config;
}

export const getFeatureStatuses = () => getFeatureWorkflowConfig().mainStatuses.map(label => ({ value: toValueKey(label), label }));
export const getSubtaskStatuses = () => getFeatureWorkflowConfig().subtaskStatuses.map(label => ({ value: toValueKey(label), label }));
export const featureStatuses = getFeatureStatuses();
export const subtaskStatuses = getSubtaskStatuses();

export const buildDefaultFeatureSubtasks = () => [
  { id: `subtask-${Date.now()}`, name: '', status: getSubtaskStatuses()[0]?.value || 'not-started', startDate: '', endDate: '', tasks: [] },
];

export const getFeatureStatusLabel = status => {
  const resolved = getFeatureStatuses().find(item => item.value === toValueKey(status));
  return resolved?.label || status || 'Unassigned';
};
export const getSubtaskStatusLabel = status => {
  const resolved = getSubtaskStatuses().find(item => item.value === toValueKey(status));
  return resolved?.label || status || 'Not Started';
};
export const createSubtask = (type, name = '', status = '') => ({
  id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  name,
  status: status || getSubtaskStatuses()[0]?.value || 'not-started',
});
export const defaultFeatureWorkflow = { mainStatuses: [...defaultMainStatuses], subtaskStatuses: [...defaultSubtaskStatuses] };
