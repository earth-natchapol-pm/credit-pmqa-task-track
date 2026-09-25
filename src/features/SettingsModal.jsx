import { useEffect, useState } from 'react';
import { defaultFeatureWorkflow, getFeatureWorkflowConfig, saveFeatureWorkflowConfig } from './config.js';

export default function SettingsModal({ onClose }) {
  const [mainStatuses, setMainStatuses] = useState(() => getFeatureWorkflowConfig().mainStatuses);
  const [subtaskStatuses, setSubtaskStatuses] = useState(() => getFeatureWorkflowConfig().subtaskStatuses);
  const [mainDraft, setMainDraft] = useState('');
  const [subtaskDraft, setSubtaskDraft] = useState('');

  useEffect(() => {
    const config = getFeatureWorkflowConfig();
    setMainStatuses(config.mainStatuses);
    setSubtaskStatuses(config.subtaskStatuses);
  }, []);

  const updateList = (setter, current, value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setter([...new Set([...current, trimmed])]);
  };

  const removeItem = (setter, current, item) => setter(current.filter(currentItem => currentItem !== item));

  const saveSettings = event => {
    event.preventDefault();
    saveFeatureWorkflowConfig({ mainStatuses, subtaskStatuses });
    onClose();
    window.location.reload();
  };

  return <div className="modal-backdrop" onClick={event => event.target === event.currentTarget && onClose()}><div className="modal feature-modal" role="dialog" aria-modal="true" aria-labelledby="settingsModalTitle"><div className="modal-header"><div><p className="eyebrow">SETTINGS</p><h2 id="settingsModalTitle">Feature workflow</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div><form onSubmit={saveSettings}><div className="form-section"><p className="form-section-title">Main feature status</p><div className="tag-list">{mainStatuses.map(status => <span key={status} className="workflow-tag">{status}<button type="button" onClick={() => removeItem(setMainStatuses, mainStatuses, status)} aria-label={`Remove ${status}`}>×</button></span>)}</div><div className="input-row"><input value={mainDraft} onChange={event => setMainDraft(event.target.value)} placeholder="Add status" /><button type="button" className="secondary-button compact" onClick={() => { updateList(setMainStatuses, mainStatuses, mainDraft); setMainDraft(''); }}>Add</button></div></div><div className="form-section"><p className="form-section-title">UAT / Live sub-task status</p><div className="tag-list">{subtaskStatuses.map(status => <span key={status} className="workflow-tag">{status}<button type="button" onClick={() => removeItem(setSubtaskStatuses, subtaskStatuses, status)} aria-label={`Remove ${status}`}>×</button></span>)}</div><div className="input-row"><input value={subtaskDraft} onChange={event => setSubtaskDraft(event.target.value)} placeholder="Add status" /><button type="button" className="secondary-button compact" onClick={() => { updateList(setSubtaskStatuses, subtaskStatuses, subtaskDraft); setSubtaskDraft(''); }}>Add</button></div></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => { setMainStatuses(defaultFeatureWorkflow.mainStatuses); setSubtaskStatuses(defaultFeatureWorkflow.subtaskStatuses); }}>Reset</button><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Save settings</button></div></form></div></div>;
}
