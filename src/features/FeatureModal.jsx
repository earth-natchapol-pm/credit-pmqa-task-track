import { useState } from 'react';
import { buildDefaultFeatureSubtasks, createSubtask, featureStatuses, getSubtaskStatuses, priorities } from './config.js';

function MultiSelectDropdown({ label, options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const selectedLabels = options.filter(option => selected.includes(String(option.id || option.name))).map(option => option.name);
  const toggle = value => onChange(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  return <div className="multi-select-field"><span className="field-label">{label}</span><button type="button" className={`multi-select-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(value => !value)} aria-expanded={open}>{selectedLabels.length ? <span>{selectedLabels.join(', ')}</span> : <span className="placeholder">{placeholder}</span>}<span aria-hidden="true">⌄</span></button>{open && <div className="multi-select-menu">{options.length ? options.map(option => { const value = String(option.id || option.name); return <label className="multi-select-option" key={value}><input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} />{option.name}{option.acronym && <small>{option.acronym}</small>}</label>; }) : <span className="multi-select-empty">No options configured</span>}</div>}</div>;
}

export default function FeatureModal({ feature, people, products = [], onClose, onSave }) {
  const [prdDocuments, setPrdDocuments] = useState(feature?.prdDocuments?.length ? feature.prdDocuments : [{ name: 'PRD', url: '' }]);
  const [selectedProductIds, setSelectedProductIds] = useState(() => feature?.productIds?.length ? feature.productIds.map(String) : products.filter(product => feature?.product?.split(', ').includes(product.name)).map(product => String(product.id || product.name)));
  const [selectedPmIds, setSelectedPmIds] = useState(() => (feature?.pmPicIds?.length ? feature.pmPicIds : feature?.pmPicId ? [feature.pmPicId] : people.filter(person => person.name === feature?.pmPic).map(person => person.id || person.name)).map(String));
  const [selectedQaIds, setSelectedQaIds] = useState(() => (feature?.qaPicIds?.length ? feature.qaPicIds : feature?.qaPicId ? [feature.qaPicId] : people.filter(person => person.name === feature?.qaPic).map(person => person.id || person.name)).map(String));
  const [subtasks, setSubtasks] = useState(() => {
    const base = Array.isArray(feature?.subtasks) ? feature.subtasks.filter(subtask => !['UAT', 'Live Testing'].includes(subtask.name)) : [];
    const initial = base.length ? base : (feature ? [] : buildDefaultFeatureSubtasks());
    return initial.map(subtask => ({
      id: subtask.id || `${subtask.name || 'subtask'}-${Date.now()}`,
      name: subtask.name || 'New subtask',
      status: subtask.status || getSubtaskStatuses()[0]?.value || 'not-started',
      startDate: subtask.startDate || (subtask.name === 'UAT' ? feature?.uatStart : feature?.liveStart) || '',
      endDate: subtask.endDate || (subtask.name === 'UAT' ? feature?.uatEnd : feature?.liveEnd) || '',
      tasks: Array.isArray(subtask.tasks) ? subtask.tasks.map(task => ({ id: task.id || `${subtask.name}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, name: task.name || '', done: Boolean(task.done) })) : [],
    }));
  });
  const subtaskOptions = getSubtaskStatuses();

  const addSubtask = () => setSubtasks(current => [...current, { ...createSubtask('feature'), name: 'New subtask', startDate: '', endDate: '', tasks: [] }]);
  const removeSubtask = subtaskId => setSubtasks(current => current.filter(item => item.id !== subtaskId));

  const updateSubtask = (subtaskId, patch) => setSubtasks(current => current.map(item => item.id === subtaskId ? { ...item, ...patch } : item));

  const addTaskToSubtask = subtaskId => {
    setSubtasks(current => current.map(item => item.id === subtaskId ? { ...item, tasks: [...(item.tasks || []), { id: `${item.name}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, name: '', done: false }] } : item));
  };

  const updateTask = (subtaskId, taskId, patch) => setSubtasks(current => current.map(item => item.id === subtaskId ? {
    ...item,
    tasks: (item.tasks || []).map(task => task.id === taskId ? { ...task, ...patch } : task),
  } : item));

  const removeTask = (subtaskId, taskId) => setSubtasks(current => current.map(item => item.id === subtaskId ? { ...item, tasks: (item.tasks || []).filter(task => task.id !== taskId) } : item));

  const submit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const productIds = selectedProductIds;
    const normalizedSubtasks = subtasks.map(subtask => ({
      id: subtask.id || `${subtask.name || 'subtask'}-${Date.now()}`,
      name: String(subtask.name || '').trim() || 'New subtask',
      status: subtask.status || subtaskOptions[0]?.value || 'not-started',
      startDate: subtask.startDate || '',
      endDate: subtask.endDate || '',
      tasks: (subtask.tasks || []).map(task => ({
        id: task.id || `${subtask.name}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name: String(task.name || '').trim() || 'Task',
        done: Boolean(task.done),
      })).filter(task => task.name),
    }));
    const pmPeople = people.filter(person => selectedPmIds.includes(String(person.id || person.name)));
    const qaPeople = people.filter(person => selectedQaIds.includes(String(person.id || person.name)));
    onSave({ ...(feature || {}), name: data.get('name'), description: data.get('description'), prdDocuments: data.getAll('prdDocument').map((url, index) => ({ name: data.getAll('prdDocumentName')[index]?.trim() || 'PRD', url })), productIds, product: products.filter(product => productIds.includes(String(product.id || product.name))).map(product => product.name).join(', ') || feature?.product || '', priority: data.get('priority'), pmPicIds: selectedPmIds, pmPicId: selectedPmIds[0] || null, pmPic: pmPeople.map(person => person.name).join(', '), qaPicIds: selectedQaIds, qaPicId: selectedQaIds[0] || null, qaPic: qaPeople.map(person => person.name).join(', '), uatStart: data.get('uatStart'), uatEnd: data.get('uatEnd'), uatStatus: data.get('uatStatus'), uatSignedOff: data.get('uatSignedOff'), uatTestCaseUrl: data.get('uatTestCaseUrl'), uatTestResultUrl: data.get('uatTestResultUrl'), liveStart: data.get('liveStart'), liveEnd: data.get('liveEnd'), liveStatus: data.get('liveStatus'), liveSignedOff: data.get('liveSignedOff'), liveTestCaseUrl: data.get('liveTestCaseUrl'), liveTestResultUrl: data.get('liveTestResultUrl'), status: data.get('status'), subtasks: normalizedSubtasks });
  };
  const field = (label, name, type = 'text', value = '') => <label>{label}<input name={name} type={type} defaultValue={value} /></label>;
  const renderSubtaskCard = subtask => <div key={subtask.id} className="feature-subtask-config"><div className="feature-subtask-config-header"><input className="subtask-name-input" value={subtask.name} onChange={event => updateSubtask(subtask.id, { name: event.target.value })} placeholder="Subtask name" /><label className="compact-field">Status<select value={subtask.status} onChange={event => updateSubtask(subtask.id, { status: event.target.value })}>{subtaskOptions.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label><button type="button" className="icon-button" onClick={() => removeSubtask(subtask.id)} aria-label={`Remove ${subtask.name || 'subtask'}`}>×</button></div><div className="form-row subtask-date-row"><label>Start date<input type="date" value={subtask.startDate} onChange={event => updateSubtask(subtask.id, { startDate: event.target.value })} /></label><label>End date<input type="date" value={subtask.endDate} onChange={event => updateSubtask(subtask.id, { endDate: event.target.value })} /></label></div><div className="feature-task-list">{(subtask.tasks || []).map(task => <div key={task.id} className="feature-task-row"><input type="checkbox" checked={Boolean(task.done)} onChange={event => updateTask(subtask.id, task.id, { done: event.target.checked })} /><input type="text" value={task.name} onChange={event => updateTask(subtask.id, task.id, { name: event.target.value })} placeholder="Add task" /><button type="button" className="icon-button" aria-label={`Remove task ${task.name || 'task'}`} onClick={() => removeTask(subtask.id, task.id)}>×</button></div>)}</div><button type="button" className="secondary-button compact" onClick={() => addTaskToSubtask(subtask.id)}>Add task</button></div>;

  return <div className="modal-backdrop" onClick={event => event.target === event.currentTarget && onClose()}><div className="modal feature-modal" role="dialog" aria-modal="true" aria-labelledby="featureModalTitle"><div className="modal-header"><div><p className="eyebrow">FEATURE CONFIGURATION</p><h2 id="featureModalTitle">{feature ? 'Edit feature' : 'Add feature'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div><form onSubmit={submit}>
    <div className="form-section"><p className="form-section-title">Feature details</p>{field('Feature name', 'name', 'text', feature?.name || '')}<label>Brief description<textarea name="description" defaultValue={feature?.description || ''} rows="3" placeholder="Summarize the feature and its intended outcome" /></label><div className="form-row"><MultiSelectDropdown label="Products" options={products} selected={selectedProductIds} onChange={setSelectedProductIds} placeholder="Choose products" /><MultiSelectDropdown label="PM PIC" options={people} selected={selectedPmIds} onChange={setSelectedPmIds} placeholder="Choose PMs" /><MultiSelectDropdown label="QA PIC" options={people} selected={selectedQaIds} onChange={setSelectedQaIds} placeholder="Choose QA" /></div><label>Priority<select name="priority" defaultValue={feature?.priority || priorities[0]}>{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></label><label>Kanban status<select name="status" defaultValue={feature?.status || featureStatuses[0].value}>{featureStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label></div>
    <div className="form-section"><p className="form-section-title">Documentation</p><div className="prd-fields">{prdDocuments.map((document, index) => <div className="prd-field" key={document.id || index}><div className="form-row"><label>Document name<input name="prdDocumentName" type="text" value={document.name || 'PRD'} onChange={event => setPrdDocuments(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} placeholder="PRD" /></label><label>Confluence link<input name="prdDocument" type="url" value={document.url} onChange={event => setPrdDocuments(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="https://your-domain.atlassian.net/wiki/..." /></label></div>{prdDocuments.length > 1 && <button type="button" className="icon-button" onClick={() => setPrdDocuments(current => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove PRD ${index + 1}`}>×</button>}</div>)}</div><button type="button" className="secondary-button compact" onClick={() => setPrdDocuments(current => [...current, { name: 'PRD', url: '' }])}>Add PRD link</button></div>
    <div className="form-section testing-form-section"><p className="form-section-title">UAT testing</p><div className="form-row">{field('Start date', 'uatStart', 'date', feature?.uatStart || '')}{field('End date', 'uatEnd', 'date', feature?.uatEnd || '')}</div><div className="form-row"><label>Status<select name="uatStatus" defaultValue={feature?.uatStatus || 'Not Started'}>{subtaskOptions.map(status => <option key={status.value}>{status.label}</option>)}</select></label>{field('Signed-off date', 'uatSignedOff', 'date', feature?.uatSignedOff || '')}</div><div className="form-row">{field('Test case link (Google Sheets)', 'uatTestCaseUrl', 'url', feature?.uatTestCaseUrl || '')}{field('Test result link (Google Slides)', 'uatTestResultUrl', 'url', feature?.uatTestResultUrl || '')}</div></div><div className="form-section testing-form-section"><p className="form-section-title">Live Testing</p><div className="form-row">{field('Start date', 'liveStart', 'date', feature?.liveStart || '')}{field('End date', 'liveEnd', 'date', feature?.liveEnd || '')}</div><div className="form-row"><label>Status<select name="liveStatus" defaultValue={feature?.liveStatus || 'Not Started'}>{subtaskOptions.map(status => <option key={status.value}>{status.label}</option>)}</select></label>{field('Signed-off date', 'liveSignedOff', 'date', feature?.liveSignedOff || '')}</div><div className="form-row">{field('Test case link (Google Sheets)', 'liveTestCaseUrl', 'url', feature?.liveTestCaseUrl || '')}{field('Test result link (Google Slides)', 'liveTestResultUrl', 'url', feature?.liveTestResultUrl || '')}</div></div><div className="form-section"><div className="subtask-section-heading"><div><p className="form-section-title">Feature subtasks</p><small>Break this feature into trackable work items.</small></div><button type="button" className="secondary-button compact" onClick={addSubtask}>Add subtask</button></div><div className="feature-subtask-editor-list">{subtasks.length ? subtasks.map(renderSubtaskCard) : <div className="feature-subtask-empty">No subtasks yet. Add one to start planning the feature.</div>}</div></div>
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Save feature</button></div>
  </form></div></div>;
}