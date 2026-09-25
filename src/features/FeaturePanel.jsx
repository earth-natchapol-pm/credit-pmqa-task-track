import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { featureStatuses, getFeatureStatusLabel, getSubtaskStatusLabel, priorities, toStatusKey } from './config.js';
import FeatureGanttPanel from './FeatureGanttPanel.jsx';
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
  const timelineItems = subtasks.map(subtask => {
    const [fallbackStart, fallbackEnd] = fallbackDates[subtask.name] || [];
    const start = subtask.startDate || fallbackStart;
    const end = subtask.endDate || fallbackEnd;
    return { subtask, start, end };
  }).sort((left, right) => {
    const startDifference = (left.start || '9999-12-31').localeCompare(right.start || '9999-12-31');
    if (startDifference) return startDifference;
    const endDifference = (left.end || '9999-12-31').localeCompare(right.end || '9999-12-31');
    if (endDifference) return endDifference;
    return (left.subtask.name || '').localeCompare(right.subtask.name || '');
  });
  return <div className="subtask-timeline"><div className="subtask-timeline-heading"><span className="field-label">TASK TIMELINE</span><span>{timelineItems.length} subtasks</span></div>{timelineItems.map(({ subtask, start, end }) => {
    const status = getSubtaskStatusLabel(subtask.status || 'not-started');
    const warning = status === 'On Hold';
    return <div className="subtask-timeline-row" key={subtask.id || subtask.name}><div className={`subtask-marker ${warning ? 'warning' : ''}`} /><div className="subtask-timeline-content"><div className="subtask-timeline-top"><strong>{subtask.name}</strong><span className={`subtask-status status-${statusClass(status)} ${warning ? 'warning' : ''}`}>{status}</span></div>{subtask.description && <p className="subtask-description">{subtask.description}</p>}<div className="subtask-timeline-meta"><span>{formatDate(start)} – {formatDate(end)}</span></div></div></div>;
  })}</div>;
}

function FeatureActions({ feature, onEdit, onRemove }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = event => { if (!menuRef.current?.contains(event.target)) setOpen(false); };
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('mousedown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape); };
  }, [open]);
  return <div className="feature-card-actions"><div className="feature-action-menu" ref={menuRef}><button className="icon-button person-more" onClick={() => setOpen(value => !value)} aria-label={`Open actions for ${feature.name}`} aria-expanded={open}>•••</button>{open && <div className="feature-action-dropdown"><button type="button" onClick={() => { setOpen(false); onEdit(feature); }}>Edit feature</button><button type="button" className="danger" onClick={() => { setOpen(false); onRemove(feature); }}>Delete feature</button></div>}</div></div>;
}

function summarizeFeature(feature, people) {
  const pmPeople = people.filter(person => (feature.pmPicIds || [feature.pmPicId]).filter(Boolean).some(id => String(person.id) === String(id)) || (!feature.pmPicIds?.length && !feature.pmPicId && feature.pmPic?.split(', ').includes(person.name)));
  const qaPeople = people.filter(person => (feature.qaPicIds || [feature.qaPicId]).filter(Boolean).some(id => String(person.id) === String(id)) || (!feature.qaPicIds?.length && !feature.qaPicId && feature.qaPic?.split(', ').includes(person.name)));
  const pmName = pmPeople.map(person => person.name).join(', ') || feature.pmPic || 'Unassigned';
  const qaName = qaPeople.map(person => person.name).join(', ') || feature.qaPic || 'Unassigned';
  const subtasks = Array.isArray(feature.subtasks) ? feature.subtasks.filter(subtask => !['UAT', 'Live Testing'].includes(subtask.name)) : [];
  const totalTasks = subtasks.length;
  const doneTasks = subtasks.filter(subtask => getSubtaskStatusLabel(subtask.status).toLowerCase() === 'done').length;
  const uatSummary = feature.uatSignedOff ? 'Signed off' : (feature.uatStatus || 'Not started');
  const liveSummary = feature.liveSignedOff ? 'Signed off' : (feature.liveStatus || 'Not started');
  const productNames = feature.productNames?.length ? feature.productNames : feature.product ? feature.product.split(',').map(item => item.trim()).filter(Boolean) : [];
  const productAcronyms = feature.productAcronyms?.length ? feature.productAcronyms : productNames.map(acronymFromName);
  return { pmName, qaName, subtasks, totalTasks, doneTasks, uatSummary, liveSummary, productNames, productAcronyms };
}

function FeatureCard({ feature, people, expanded, onToggleExpand, onEdit, onRemove }) {
  const { pmName, qaName, subtasks, totalTasks, doneTasks, uatSummary, liveSummary, productNames, productAcronyms } = summarizeFeature(feature, people);
  return <article className={`feature-card ${expanded ? 'expanded' : 'collapsed'}`}><div className="feature-card-header"><div className="feature-card-title"><span className={`priority priority-${(feature.priority || 'p2').toLowerCase()}`}>{feature.priority}</span><h3>{feature.name}</h3><div className="feature-products" aria-label={`Products: ${productNames.join(', ') || 'none'}`}>{productAcronyms.length ? productAcronyms.map((acronym, index) => <span className="product-acronym" title={productNames[index] || acronym} key={`${acronym}-${index}`}>{acronym}</span>) : <span className="no-product">No product</span>}</div><div className="feature-card-meta"><span>PM {pmName}</span><span>QA {qaName}</span></div><div className="feature-status-cell"><span className={`feature-status-badge status-${statusClass(feature.status)}`}>{getFeatureStatusLabel(feature.status)}</span></div></div><div className="feature-card-header-actions"><button type="button" className="icon-button feature-expand-toggle" onClick={onToggleExpand} aria-expanded={expanded} aria-label={expanded ? `Collapse ${feature.name}` : `Expand ${feature.name}`}>{expanded ? '▾' : '▸'}</button><FeatureActions feature={feature} onEdit={onEdit} onRemove={onRemove} /></div></div>{!expanded && <p className="feature-collapsed-summary"><span><b>UAT</b> {uatSummary}</span><span><b>LT</b> {liveSummary}</span>{subtasks.length > 0 && <span><b>Task done</b> {doneTasks}/{totalTasks}</span>}</p>}{expanded && <>{feature.description && <p className="feature-description">{feature.description}</p>}{feature.prdDocuments?.length > 0 && <div className="feature-documents"><span className="field-label">PRD</span>{feature.prdDocuments.map(document => <a key={document.id || document.url} href={prdHref(document.url)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${document.name || 'PRD'} for ${feature.name}`}>{document.name || 'Open PRD'} <span aria-hidden="true">↗</span></a>)}</div>}<TestingCheckpoints feature={feature} /><SubtaskTimeline feature={feature} subtasks={subtasks} /></>}</article>;
}

// The column already tells the status, so the card only carries priority, products, owners, and testing progress.
function KanbanFeatureCard({ feature, people, showStatus, onEdit, onRemove }) {
  const { pmName, qaName, subtasks, totalTasks, doneTasks, uatSummary, liveSummary, productNames, productAcronyms } = summarizeFeature(feature, people);
  return <article className="kanban-feature-card" onClick={() => onEdit(feature)}>
    <div className="kanban-feature-top">
      <span className={`priority priority-${(feature.priority || 'p2').toLowerCase()}`}>{feature.priority}</span>
      <div className="kanban-feature-products" aria-label={`Products: ${productNames.join(', ') || 'none'}`}>{productAcronyms.length ? productAcronyms.map((acronym, index) => <span className="product-acronym" title={productNames[index] || acronym} key={`${acronym}-${index}`}>{acronym}</span>) : <span className="no-product">No product</span>}</div>
      <div className="kanban-feature-actions" onClick={event => event.stopPropagation()}><FeatureActions feature={feature} onEdit={onEdit} onRemove={onRemove} /></div>
    </div>
    <h4 title={feature.name}>{feature.name}</h4>
    {showStatus && <span className={`feature-status-badge status-${statusClass(feature.status)}`}>{getFeatureStatusLabel(feature.status)}</span>}
    <dl className="kanban-feature-pic">
      <div><dt>PM</dt><dd title={pmName}>{pmName}</dd></div>
      <div><dt>QA</dt><dd title={qaName}>{qaName}</dd></div>
    </dl>
    <div className="kanban-feature-summary"><span><b>UAT</b> {uatSummary}</span><span><b>LT</b> {liveSummary}</span>{subtasks.length > 0 && <span className="kanban-feature-done"><b>Done</b> {doneTasks}/{totalTasks}</span>}</div>
  </article>;
}

// One column per workflow status, plus a catch-all so features with an unknown or legacy status never disappear from the board.
function buildKanbanColumns(features) {
  const columns = featureStatuses.map(status => ({ ...status, items: features.filter(feature => toStatusKey(feature.status) === status.value) }));
  const known = new Set(featureStatuses.map(status => status.value));
  const orphans = features.filter(feature => !known.has(toStatusKey(feature.status)));
  if (orphans.length) columns.push({ value: '__other', label: 'Other status', items: orphans, other: true });
  return columns;
}

function KanbanBoard({ features, people, onEdit, onRemove }) {
  const columns = buildKanbanColumns(features);
  return <div className="kanban-board">{columns.map((column, index) => <section className={`kanban-column ${column.items.length ? '' : 'is-empty'} ${column.other ? 'is-other' : ''}`} key={column.value} aria-label={`${column.label}: ${column.items.length} features`}>
    <header className="kanban-column-title"><span className="kanban-column-index">{index + 1}</span><h2 title={column.label}>{column.label}</h2><span className="kanban-column-count">{column.items.length}</span></header>
    <div className="kanban-cards">{column.items.length ? column.items.map(feature => <KanbanFeatureCard key={String(feature.id || feature.name)} feature={feature} people={people} showStatus={Boolean(column.other)} onEdit={onEdit} onRemove={onRemove} />) : <p className="kanban-empty">No features</p>}</div>
  </section>)}</div>;
}

export default function FeaturePanel({ features, people, loading, error, onAdd, onEdit, onRemove, onOpenSettings }) {
  const [mode, setMode] = useState('list');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const featureKey = feature => String(feature.id || feature.name);
  const visibleFeatures = features.filter(feature => (priorityFilter === 'All' || feature.priority === priorityFilter) && (statusFilter === 'All' || feature.status === statusFilter) && (!search.trim() || `${feature.name} ${feature.product || ''} ${(feature.productNames || []).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase())));
  const toggleExpand = key => setExpandedIds(current => { const next = new Set(current); if (next.has(key)) { next.delete(key); } else { next.add(key); } return next; });
  const allExpanded = visibleFeatures.length > 0 && visibleFeatures.every(feature => expandedIds.has(featureKey(feature)));
  const toggleExpandAll = () => setExpandedIds(current => { const next = new Set(current); visibleFeatures.forEach(feature => allExpanded ? next.delete(featureKey(feature)) : next.add(featureKey(feature))); return next; });

  return <section className="features-view"><div className="features-heading"><div><p className="eyebrow">RELEASE CONTROL</p><h1>Features</h1><p className="subheading">Track ownership, UAT readiness, and live testing sign-off in one place.</p></div><div className="features-heading-actions"><button className="secondary-button compact" onClick={onOpenSettings}>Workflow settings</button><button className="primary-button" onClick={onAdd}><span>＋</span> Add feature</button></div></div>{error && <div className="people-alert">{error}</div>}<div className="features-toolbar">{mode !== 'timeline' ? <div className="feature-filters"><div className="search-wrap"><span>⌕</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search features..." aria-label="Search features" /></div><select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} aria-label="Filter by priority"><option value="All">All priorities</option>{priorities.map(priority => <option key={priority}>{priority}</option>)}</select><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="All">All statuses</option>{featureStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div> : <div />}<div className="features-toolbar-right">{mode === 'list' && <button type="button" className="secondary-button compact" onClick={toggleExpandAll} disabled={!visibleFeatures.length}>{allExpanded ? 'Collapse all' : 'Expand all'}</button>}<div className="view-toggle" aria-label="Feature view"><button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>☷ List</button><button className={mode === 'kanban' ? 'active' : ''} onClick={() => setMode('kanban')}>▦ Kanban</button><button className={mode === 'timeline' ? 'active' : ''} onClick={() => setMode('timeline')}>▤ Timeline</button></div></div></div>{loading ? <div className="people-empty">Loading features...</div> : mode === 'list' ? <div className="feature-list">{visibleFeatures.map(feature => <FeatureCard key={featureKey(feature)} feature={feature} people={people} expanded={expandedIds.has(featureKey(feature))} onToggleExpand={() => toggleExpand(featureKey(feature))} onEdit={onEdit} onRemove={onRemove} />)}</div> : mode === 'kanban' ? <KanbanBoard features={visibleFeatures} people={people} onEdit={onEdit} onRemove={onRemove} /> :<FeatureGanttPanel features={features} people={people} />}</section>;
}
