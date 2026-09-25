import { useState } from 'react';
import './FeatureTimeline.css';

const timelineDate = value => value ? new Date(`${value}T12:00:00`) : null;
const timelineLabel = value => value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();

export default function FeatureGanttPanel({ features, people }) {
  const [productFilter, setProductFilter] = useState('All');
  const [personFilter, setPersonFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const products = Array.from(new Map(features.flatMap(feature => (feature.productNames || []).map((name, index) => [name, feature.productAcronyms?.[index] || name])).entries()).entries()).map(([name, acronym]) => ({ name, acronym }));
  const visibleFeatures = features.filter(feature => {
    const productMatch = productFilter === 'All' || (feature.productNames || []).includes(productFilter) || feature.product?.split(',').map(item => item.trim()).includes(productFilter);
    const assignedIds = [...(feature.pmPicIds || []), ...(feature.qaPicIds || []), feature.pmPicId, feature.qaPicId].filter(Boolean).map(String);
    const assignedNames = `${feature.pmPic || ''},${feature.qaPic || ''}`.split(',').map(item => item.trim());
    const personMatch = personFilter === 'All' || assignedIds.includes(personFilter) || assignedNames.includes(personFilter);
    return productMatch && personMatch && (priorityFilter === 'All' || feature.priority === priorityFilter);
  });
  const datedValues = visibleFeatures.flatMap(feature => [feature.uatStart, feature.uatEnd, feature.liveStart, feature.liveEnd, ...(feature.subtasks || []).flatMap(subtask => [subtask.startDate, subtask.endDate])]).filter(Boolean).map(timelineDate);
  const today = new Date(2026, 8, 24);
  const rangeStart = new Date(Math.min(today.getTime(), ...(datedValues.length ? datedValues.map(date => date.getTime()) : [today.getTime()])));
  const rangeEnd = new Date(Math.max(today.getTime() + (14 * 86400000), ...(datedValues.length ? datedValues.map(date => date.getTime()) : [today.getTime() + (14 * 86400000)])));
  rangeStart.setDate(rangeStart.getDate() - 2);
  rangeEnd.setDate(rangeEnd.getDate() + 2);
  const days = [];
  for (const date = new Date(rangeStart); date <= rangeEnd; date.setDate(date.getDate() + 1)) days.push(new Date(date));
  const totalDays = days.length;
  const position = (startValue, endValue) => {
    const start = timelineDate(startValue) || rangeStart;
    const end = timelineDate(endValue) || start;
    const startOffset = Math.max(0, Math.round((start - rangeStart) / 86400000));
    const duration = Math.max(1, Math.round((end - start) / 86400000) + 1);
    return { left: `${(startOffset / totalDays) * 100}%`, width: `${(Math.min(duration, totalDays - startOffset) / totalDays) * 100}%` };
  };
  const getPeople = (feature, field, fallback) => {
    const ids = feature[field] || (feature[fallback] ? [feature[fallback]] : []);
    return people.filter(person => ids.some(id => String(id) === String(person.id))).map(person => person.name).join(', ') || feature[fallback.replace('Ids', '')] || 'Unassigned';
  };
  const featureBars = feature => {
    const bars = [];
    if (feature.uatStart || feature.uatEnd) bars.push({ key: 'uat', className: 'gantt-uat', label: 'UAT', status: feature.uatStatus, start: feature.uatStart, end: feature.uatEnd });
    if (feature.liveStart || feature.liveEnd) bars.push({ key: 'live', className: 'gantt-live', label: 'LIVE', status: feature.liveStatus, start: feature.liveStart, end: feature.liveEnd });
    (feature.subtasks || []).filter(subtask => !['UAT', 'Live Testing'].includes(subtask.name) && (subtask.startDate || subtask.endDate)).forEach(subtask => bars.push({ key: subtask.id || subtask.name, className: 'gantt-subtask', label: subtask.name, status: subtask.status, start: subtask.startDate, end: subtask.endDate }));
    return bars;
  };
  return <div className="feature-gantt-view"><div className="gantt-filters"><label>Product<select value={productFilter} onChange={event => setProductFilter(event.target.value)}><option>All</option>{products.map(product => <option key={product.name} value={product.name}>{product.acronym} · {product.name}</option>)}</select></label><label>People<select value={personFilter} onChange={event => setPersonFilter(event.target.value)}><option>All</option>{people.map(person => <option key={person.id || person.name} value={String(person.id || person.name)}>{person.name}</option>)}</select></label><label>Priority<select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)}><option>All</option>{['P0', 'P1', 'P2', 'P3'].map(priority => <option key={priority}>{priority}</option>)}</select></label><button type="button" className="secondary-button compact" onClick={() => { setProductFilter('All'); setPersonFilter('All'); setPriorityFilter('All'); }}>Reset filters</button><span className="gantt-filter-count">{visibleFeatures.length} feature{visibleFeatures.length === 1 ? '' : 's'}</span></div><div className="gantt-shell"><div className="gantt-scroll"><div className="gantt-grid" style={{ '--gantt-days': totalDays }}><div className="gantt-corner"><span>TASK</span></div><div className="gantt-dates">{days.map((date, index) => <span className={date.toDateString() === today.toDateString() ? 'today' : ''} key={date.toISOString()}>{index === 0 || date.getDate() === 1 || date.getDay() === 1 ? timelineLabel(date) : ''}</span>)}</div>{visibleFeatures.length ? visibleFeatures.map(feature => { const pm = getPeople(feature, 'pmPicIds', 'pmPic'); const qa = getPeople(feature, 'qaPicIds', 'qaPic'); const bars = featureBars(feature); return <div className="gantt-feature-group" key={feature.id || feature.name}><div className="gantt-feature-heading"><strong>{feature.name}</strong><small>PM {pm} · QA {qa}</small></div>{bars.length ? bars.map(bar => <div className="gantt-task-row" key={bar.key}><div className="gantt-task-label" title={bar.label}>{bar.label}</div><div className="gantt-task-track"><div className="gantt-grid-lines" /><span className={`gantt-bar ${bar.className}`} style={position(bar.start, bar.end)}>{bar.status || 'Planned'}</span></div></div>) : <div className="gantt-task-row"><div className="gantt-task-label">No dates scheduled</div><div className="gantt-task-track"><div className="gantt-grid-lines" /></div></div>}</div>; }) : <div className="gantt-empty">No features match these filters.</div>}</div></div><div className="gantt-legend"><span><i className="legend-uat" />UAT</span><span><i className="legend-live" />Live Testing</span><span><i className="legend-subtask" />Subtask</span><span><i className="legend-today" />Today</span></div></div></div>;
}
