import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { featureStatuses, getFeatureStatusLabel, getSubtaskStatusLabel, priorities } from './config.js';
import './feature-overrides.css';

const formatDate = date => date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() : '—';
const personInitials = name => name ? name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() : '—';
const prdHref = url => /^https?:\/\//i.test(url) ? url : `https://${url}`;
const acronymFromName = name => String(name || '').split(/\s+/).filter(Boolean).map(part => part[0]).join('').toUpperCase().slice(0, 5) || '—';
const statusClass = status => String(status || 'unassigned').toLowerCase().replace(/[^a-z0-9]+/g, '-');

function TestingCheckpoints({ feature }) {
  const checkpoints = [
    { label: 'UAT', start: feature.uatStart, end: feature.uatEnd, status: feature.uatStatus, signed: feature.uatSignedOff, testCaseUrl: feature.uatTestCaseUrl, testResultUrl: feature.uatTestResultUrl },
    { label: 'Live testing', start: feature.liveStart, end: feature.liveEnd, status: feature.liveStatus, signed: feature.liveSignedOff, testCaseUrl: feature.liveTestCaseUrl, testResultUrl: feature.liveTestResultUrl },
  ];
  return <div className="subtask-timeline testing-timeline"><div className="subtask-timeline-heading"><span className="field-label">TESTING TIMELINE</span><span>2 checkpoints</span></div>{checkpoints.map(checkpoint => { const status = checkpoint.status || 'Not scheduled'; const warning = status.toLowerCase().includes('hold') || status.toLowerCase().includes('risk') || status.toLowerCase().includes('block'); return <div className="subtask-timeline-row" key={checkpoint.label}><div className={`subtask-marker ${warning ? 'warning' : ''}`} /><div className="subtask-timeline-content"><div className="subtask-timeline-top"><strong>{checkpoint.label}</strong><span className={`subtask-status status-${statusClass(status)} ${warning ? 'warning' : ''}`}>{status}</span></div><div className="subtask-timeline-meta"><span>{checkpoint.start || checkpoint.end ? `${formatDate(checkpoint.start)} – ${formatDate(checkpoint.end)}` : 'No dates scheduled'}</span>{checkpoint.signed && <span>Signed off {formatDate(checkpoint.signed)}</span>}</div><div className="testing-resource-links">{checkpoint.testCaseUrl && <a href={prdHref(checkpoint.testCaseUrl)} target="_blank" rel="noopener noreferrer">Test cases <span>↗</span></a>}{checkpoint.testResultUrl && <a href={prdHref(checkpoint.testResultUrl)} target="_blank" rel="noopener noreferrer">Test results <span>↗</span></a>}</div></div></div>; })}</div>;
}

function SubtaskTimeline({ feature, subtasks }) {
  const fallbackDates = { UAT: [feature.uatStart, feature.uatEnd], 'Live Testing': [feature.liveStart, feature.liveEnd] };
  const timelineItems = subtasks.flatMap(subtask => {
    const [fallbackStart, fallbackEnd] = fallbackDates[subtask.name] || [];
    const start = subtask.startDate || fallbackStart;
    const end = subtask.endDate || fallbackEnd;
    const tasks = subtask.tasks || [];
    return tasks.length ? tasks.map(task => ({ task, subtask, start, end })) : [{ task: null, subtask, start, end }];
  });
  return <div className="subtask-timeline"><div className="subtask-timeline-heading"><span className="field-label">TASK TIMELINE</span><span>{timelineItems.filter(item => item.task).length} tasks</span></div>{timelineItems.map(({ task, subtask, start, end }, index) => {
    const status = task ? (task.done ? 'Done' : 'Not Started') : getSubtaskStatusLabel(subtask.status || 'not-started');
    const warning = status === 'On Hold';
    return <div className="subtask-timeline-row" key={task?.id || `${subtask.id || subtask.name}-${index}`}><div className={`subtask-marker ${warning ? 'warning' : ''}`} /><div className="subtask-timeline-content"><div className="subtask-timeline-top"><div><strong>{task?.name || 'No tasks added'}</strong><small className="timeline-parent">{subtask.name}</small></div><span className={`subtask-status status-${statusClass(status)} ${warning ? 'warning' : ''}`}>{status}</span></div><div className="subtask-timeline-meta"><span>{formatDate(start)} – {formatDate(end)}</span>{task && <span>{task.done ? 'Completed' : 'Open task'}</span>}</div></div></div>;
  })}</div>;
}

function FeatureCard({ feature, people, onEdit, onRemove }) {
  const pmPeople = people.filter(person => (feature.pmPicIds || [feature.pmPicId]).filter(Boolean).some(id => String(person.id) === String(id)) || (!feature.pmPicIds?.length && !feature.pmPicId && feature.pmPic?.split(', ').includes(person.name)));
  const qaPeople = people.filter(person => (feature.qaPicIds || [feature.qaPicId]).filter(Boolean).some(id => String(person.id) === String(id)) || (!feature.qaPicIds?.length && !feature.qaPicId && feature.qaPic?.split(', ').includes(person.name)));
  const pmName = pmPeople.map(person => person.name).join(', ') || feature.pmPic || 'Unassigned';
  const qaName = qaPeople.map(person => person.name).join(', ') || feature.qaPic || 'Unassigned';
  const subtasks = Array.isArray(feature.subtasks) ? feature.subtasks.filter(subtask => !['UAT', 'Live Testing'].includes(subtask.name)) : [];

  const productNames = feature.productNames?.length ? feature.productNames : feature.product ? feature.product.split(',').map(item => item.trim()).filter(Boolean) : [];
  const productAcronyms = feature.productAcronyms?.length ? feature.productAcronyms : productNames.map(acronymFromName);
  return <article className="feature-card"><div className="feature-card-header"><div className="feature-card-title"><span className={`priority priority-${(feature.priority || 'p2').toLowerCase()}`}>{feature.priority}</span><h3>{feature.name}</h3><div className="feature-products" aria-label={`Products: ${productNames.join(', ') || 'none'}`}>{productAcronyms.length ? productAcronyms.map((acronym, index) => <span className="product-acronym" title={productNames[index] || acronym} key={`${acronym}-${index}`}>{acronym}</span>) : <span className="no-product">No product</span>}</div></div><div className="feature-card-actions"><button className="secondary-button compact" onClick={() => onEdit(feature)}>Edit</button><button className="icon-button person-more" onClick={() => onRemove(feature)} aria-label={`Remove ${feature.name}`}>×</button></div></div><div className="feature-card-meta"><span className={`feature-status-badge status-${statusClass(feature.status)}`}>{getFeatureStatusLabel(feature.status)}</span><span>PM {pmName}</span><span>QA {qaName}</span></div>{feature.description && <p className="feature-description">{feature.description}</p>}{feature.prdDocuments?.length > 0 && <div className="feature-documents"><span className="field-label">PRD</span>{feature.prdDocuments.map(document => <a key={document.id || document.url} href={prdHref(document.url)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${document.name || 'PRD'} for ${feature.name}`}>{document.name || 'Open PRD'} <span aria-hidden="true">↗</span></a>)}</div>}<TestingCheckpoints feature={feature} /><SubtaskTimeline feature={feature} subtasks={subtasks} /></article>;
}

export default function FeaturePanel({ features, people, loading, error, onAdd, onEdit, onRemove, onOpenSettings }) {
  const [mode, setMode] = useState('list');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const visibleFeatures = features.filter(feature => (priorityFilter === 'All' || feature.priority === priorityFilter) && (statusFilter === 'All' || feature.status === statusFilter));

  return <section className="features-view"><div className="features-heading"><div><p className="eyebrow">RELEASE CONTROL</p><h1>Features</h1><p className="subheading">Track ownership, UAT readiness, and live testing sign-off in one place.</p></div><div className="features-heading-actions"><button className="secondary-button compact" onClick={onOpenSettings}>Workflow settings</button><button className="primary-button" onClick={onAdd}><span>＋</span> Add feature</button></div></div>{error && <div className="people-alert">{error}</div>}<div className="features-toolbar"><div className="feature-filters"><select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} aria-label="Filter by priority"><option value="All">All priorities</option>{priorities.map(priority => <option key={priority}>{priority}</option>)}</select><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="All">All statuses</option>{featureStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div><div className="view-toggle" aria-label="Feature view"><button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>☷ List</button><button className={mode === 'kanban' ? 'active' : ''} onClick={() => setMode('kanban')}>▦ Kanban</button></div></div>{loading ? <div className="people-empty">Loading features...</div> : mode === 'list' ? <div className="feature-list">{visibleFeatures.map(feature => <FeatureCard key={feature.id || feature.name} feature={feature} people={people} onEdit={onEdit} onRemove={onRemove} />)}</div> : <div className="kanban-board">{featureStatuses.map(column => <div className="kanban-column" key={column.value}><div className="kanban-column-title"><h2>{column.label}</h2><span>{visibleFeatures.filter(feature => feature.status === column.value).length}</span></div><div className="kanban-cards">{visibleFeatures.filter(feature => feature.status === column.value).map(feature => <FeatureCard key={feature.id || feature.name} feature={feature} people={people} onEdit={onEdit} onRemove={onRemove} />)}</div></div>)}</div>}</section>;
}
