import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { featureStatuses, priorities } from './config.js';

const formatDate = date => date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() : '—';
const personInitials = name => name ? name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() : '—';

function StatusPill({ status }) {
  const label = featureStatuses.find(item => item.value === status)?.label || status;
  return <span className={`feature-status status-${status}`}>{label}</span>;
}

function TestingDates({ feature }) {
  return <div className="testing-dates"><div><span className="testing-label">UAT</span><strong>{formatDate(feature.uatStart)} – {formatDate(feature.uatEnd)}</strong><small className={feature.uatStatus === 'Blocked' ? 'date-warning' : ''}>{feature.uatStatus}{feature.uatSignedOff ? ` · signed ${formatDate(feature.uatSignedOff)}` : ''}</small></div><div><span className="testing-label live-label">LIVE</span><strong>{formatDate(feature.liveStart)} – {formatDate(feature.liveEnd)}</strong><small className={feature.liveStatus === 'At risk' ? 'date-warning' : ''}>{feature.liveStatus}{feature.liveSignedOff ? ` · signed ${formatDate(feature.liveSignedOff)}` : ''}</small></div></div>;
}

function FeatureCard({ feature, people, onEdit, onRemove }) {
  const pm = people.find(person => (feature.pmPicId && String(person.id) === String(feature.pmPicId)) || (!feature.pmPicId && person.name === feature.pmPic));
  const qa = people.find(person => (feature.qaPicId && String(person.id) === String(feature.qaPicId)) || (!feature.qaPicId && person.name === feature.qaPic));
  const pmName = pm?.name || feature.pmPic || 'Unassigned';
  const qaName = qa?.name || feature.qaPic || 'Unassigned';
  return <article className="feature-card"><div className="feature-card-header"><div><span className={`priority priority-${feature.priority.toLowerCase()}`}>{feature.priority}</span><h3>{feature.name}</h3><small>{feature.product}</small></div><div className="feature-card-actions"><button className="secondary-button compact" onClick={() => onEdit(feature)}>Edit</button><button className="icon-button person-more" onClick={() => onRemove(feature)} aria-label={`Remove ${feature.name}`}>×</button></div></div><div className="feature-card-body"><div className="pic-pair"><div><span className="field-label">PM PIC</span><span className="pic"><Avatar initials={personInitials(pmName)} tone={pm?.tone || 'avatar-orange'} />{pmName}</span></div><div><span className="field-label">QA PIC</span><span className="pic"><Avatar initials={personInitials(qaName)} tone={qa?.tone || 'avatar-mint'} />{qaName}</span></div></div><TestingDates feature={feature} /></div></article>;
}

export default function FeaturePanel({ features, people, loading, error, onAdd, onEdit, onRemove }) {
  const [mode, setMode] = useState('list');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const visibleFeatures = features.filter(feature => (priorityFilter === 'All' || feature.priority === priorityFilter) && (statusFilter === 'All' || feature.status === statusFilter));
  return <section className="features-view"><div className="features-heading"><div><p className="eyebrow">RELEASE CONTROL</p><h1>Features</h1><p className="subheading">Track ownership, UAT readiness, and live testing sign-off in one place.</p></div><button className="primary-button" onClick={onAdd}><span>＋</span> Add feature</button></div>{error && <div className="people-alert">{error}</div>}<div className="features-toolbar"><div className="feature-filters"><select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} aria-label="Filter by priority"><option value="All">All priorities</option>{priorities.map(priority => <option key={priority}>{priority}</option>)}</select><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="All">All statuses</option>{featureStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div><div className="view-toggle" aria-label="Feature view"><button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>☷ List</button><button className={mode === 'kanban' ? 'active' : ''} onClick={() => setMode('kanban')}>▦ Kanban</button></div></div>{loading ? <div className="people-empty">Loading features...</div> : mode === 'list' ? <div className="feature-list">{visibleFeatures.map(feature => <FeatureCard key={feature.id || feature.name} feature={feature} people={people} onEdit={onEdit} onRemove={onRemove} />)}</div> : <div className="kanban-board">{featureStatuses.map(column => <div className="kanban-column" key={column.value}><div className="kanban-column-title"><h2>{column.label}</h2><span>{visibleFeatures.filter(feature => feature.status === column.value).length}</span></div><div className="kanban-cards">{visibleFeatures.filter(feature => feature.status === column.value).map(feature => <FeatureCard key={feature.id || feature.name} feature={feature} people={people} onEdit={onEdit} onRemove={onRemove} />)}</div></div>)}</div>}</section>;
}
