import { useEffect, useState } from 'react';
import '../styles.css';
import './readability.css';
import Avatar from './components/Avatar.jsx';
import PeoplePanel from './people/PeoplePanel.jsx';
import PeopleModal from './people/PeopleModal.jsx';
import FeaturePanel from './features/FeaturePanel.jsx';
import FeatureModal from './features/FeatureModal.jsx';
import ProductPanel from './products/ProductPanel.jsx';
import ProductModal from './products/ProductModal.jsx';
import FeatureSettingsModal from './features/SettingsModal.jsx';
import './features/FeatureTimeline.css';
import { createPerson, deletePerson, listPeople, updatePerson } from './people/repository.js';
import { createFeature, deleteFeature, listFeatures, updateFeature } from './features/repository.js';
import { createProduct, deleteProduct, listProducts, updateProduct } from './products/repository.js';

const initialTasks = [
  { name: 'Add co-applicant validation', feature: 'Application onboarding', owner: 'Maya L.', status: 'qa', statusLabel: 'In QA', due: '24 SEP' },
  { name: 'Verify income source rules', feature: 'Application onboarding', owner: 'Ravi S.', status: 'todo', statusLabel: 'To do', due: '25 SEP' },
  { name: 'Repayment schedule edge cases', feature: 'Credit limit increase', owner: 'Tessa C.', status: 'risk', statusLabel: 'At risk', due: 'TODAY' },
  { name: 'New limit approval journey', feature: 'Credit limit increase', owner: 'Jamie M.', status: 'qa', statusLabel: 'In QA', due: '26 SEP' },
  { name: 'Statement export permissions', feature: 'Statement history', owner: 'Maya L.', status: 'todo', statusLabel: 'To do', due: '29 SEP' },
  { name: 'Risk band regression pass', feature: 'Risk decisioning', owner: 'Ravi S.', status: 'qa', statusLabel: 'In QA', due: '30 SEP' },
];

const navItems = [
  ['overview', '◈', 'Overview'],
  ['tasks', '☷', 'All tasks'],
  ['timeline', '▤', 'QA timeline'],
  ['features', '◇', 'Features'],
  ['people', '♙', 'People'],
  ['products', '▣', 'Products'],
];

const avatars = { 'Jamie M.': ['JM', 'avatar-mint'], 'Ravi S.': ['RS', 'avatar-lilac'], 'Tessa C.': ['TC', 'avatar-blue'] };

function Sidebar({ activeView, setActiveView, taskCount }) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark">C</span><span>credit / pmqa</span></div>
    <div className="workspace-switcher"><span className="tiny-label">WORKSPACE</span><strong>Credit Platform</strong><span className="chevron">⌄</span></div>
    <nav className="main-nav" aria-label="Primary navigation">
      {navItems.map(([view, icon, label]) => <button key={view} className={`nav-item ${activeView === view ? 'active' : ''}`} onClick={() => setActiveView(view)}><span className="nav-icon">{icon}</span>{label}{view === 'tasks' && <span className="nav-count">{taskCount}</span>}{view === 'features' && <span className="nav-count">08</span>}</button>)}
    </nav>
    <div className="sidebar-section"><span className="tiny-label">TEAMS</span><div className="team-row"><span className="team-dot dot-blue" />Product</div><div className="team-row"><span className="team-dot dot-lilac" />Engineering</div><div className="team-row"><span className="team-dot dot-mint" />QA</div></div>
  </aside>;
}

function Metrics({ taskCount }) {
  return <section className="metrics-grid" aria-label="Team summary">
    <article className="metric-card accent-blue"><div className="metric-top"><span className="metric-label">OPEN TASKS</span><span className="metric-icon">☷</span></div><strong className="metric-value">{String(taskCount).padStart(2, '0')}</strong><span className="metric-note positive">↑ 12% <em>vs last week</em></span></article>
    <article className="metric-card accent-lilac"><div className="metric-top"><span className="metric-label">IN QA THIS WEEK</span><span className="metric-icon">✓</span></div><strong className="metric-value">07</strong><span className="metric-note">Across 3 features</span></article>
    <article className="metric-card accent-mint"><div className="metric-top"><span className="metric-label">QA CAPACITY</span><span className="metric-icon">◒</span></div><strong className="metric-value">82<span className="metric-unit">%</span></strong><span className="metric-note positive">Healthy <em>4h buffer</em></span></article>
    <article className="metric-card accent-peach"><div className="metric-top"><span className="metric-label">AT RISK</span><span className="metric-icon">△</span></div><strong className="metric-value">03</strong><span className="metric-note warning">Needs attention</span></article>
  </section>;
}

function TaskRow({ task, index, onToggle }) {
  const [initials, tone] = avatars[task.owner] || ['AK', 'avatar-orange'];
  return <div className="task-row"><button className={`check ${task.complete ? 'done' : ''}`} onClick={onToggle} aria-label={`Mark ${task.name} complete`}>{task.complete ? '✓' : ''}</button><div className="task-name">{task.name}<span className="task-meta"><Avatar initials={initials} tone={tone} />{task.owner}</span></div><div className="feature-name">{task.feature}</div><span className={`status-pill ${task.status}`}>{task.statusLabel}</span><span className={`due ${task.due === 'TODAY' ? 'overdue' : ''}`}>{task.due}</span></div>;
}

function TasksPanel({ tasks, setTasks, activeView, setActiveView }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const visibleTasks = tasks.filter(task => (filter === 'all' || task.status === filter) && `${task.name} ${task.feature} ${task.owner}`.toLowerCase().includes(query.toLowerCase()));
  const counts = { all: tasks.length, todo: tasks.filter(task => task.status === 'todo').length, qa: tasks.filter(task => task.status === 'qa').length, risk: tasks.filter(task => task.status === 'risk').length };
  const toggleTask = index => setTasks(current => current.map((task, taskIndex) => taskIndex === index ? { ...task, complete: !task.complete } : task));
  return <div className="panel tasks-panel"><div className="panel-header"><div><p className="eyebrow">WORK QUEUE</p><h2>Tasks by feature</h2></div><button className="text-button" onClick={() => setActiveView('tasks')}>View all <span>→</span></button></div><div className="task-toolbar"><div className="search-wrap"><span>⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tasks or features..." aria-label="Search tasks" /></div><div className="filter-group">{[['all', 'All'], ['todo', 'To do'], ['qa', 'In QA'], ['risk', 'At risk']].map(([key, label]) => <button key={key} className={`filter-button ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label} <span>{counts[key]}</span></button>)}</div></div><div className="task-list">{visibleTasks.length ? visibleTasks.map((task, index) => <TaskRow key={`${task.name}-${index}`} task={task} index={index} onToggle={() => toggleTask(tasks.indexOf(task))} />) : <div className="empty-state">No tasks match this view.</div>}</div></div>;
}

function TimelinePanel() {
  const [weekOffset, setWeekOffset] = useState(0);
  const start = new Date(2026, 8, 21 + (weekOffset * 7));
  const end = new Date(start); end.setDate(start.getDate() + 4);
  const format = date => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const moveWeek = amount => setWeekOffset(current => current + amount);
  return <div className="panel timeline-panel"><div className="panel-header"><div><p className="eyebrow">RESOURCE PLANNING</p><h2>QA timeline</h2></div><button className="icon-button small" onClick={() => moveWeek(1)} aria-label="Next week">→</button></div><div className="week-control"><button onClick={() => moveWeek(-1)} aria-label="Previous week">‹</button><strong>{format(start)} – {format(end)}</strong><button onClick={() => moveWeek(1)} aria-label="Next week">›</button></div><div className="timeline-grid"><div className="timeline-head"><span></span><span>MON 21</span><span>TUE 22</span><span>WED 23</span><span>THU 24</span><span>FRI 25</span></div><TimelineRow person="Jamie M." role="QA lead" bars={[[0, 'Regression', 'bar-green', '100%'], [1, 'Regression', 'bar-green', '70%'], [2, 'API checks', 'bar-yellow', '82%']]} /><TimelineRow person="Ravi S." role="QA engineer" bars={[[0, 'Credit limit', 'bar-purple', '65%'], [1, 'Credit limit', 'bar-purple', '100%'], [2, 'Credit limit', 'bar-purple', '55%']]} /><TimelineRow person="Tessa C." role="QA engineer" bars={[[1, 'Onboarding', 'bar-orange', '90%'], [2, 'Onboarding', 'bar-orange', '100%'], [3, 'Onboarding', 'bar-orange', '75%']]} /></div><div className="capacity-note"><span className="status-dot" /><div><strong>Capacity looks healthy</strong><small>4 hours unallocated across the team this week.</small></div><span className="arrow">→</span></div></div>;
}

const timelineDate = value => value ? new Date(`${value}T12:00:00`) : null;
const timelineLabel = value => value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
const timelineInitials = name => String(name || '').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || '—';

function FeatureGanttPanel({ features, people, loading, error }) {
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
  return <section className="feature-gantt-view"><div className="features-heading"><div><p className="eyebrow">RESOURCE PLANNING</p><h1>Features timeline</h1><p className="subheading">See each feature, its PICs, and the UAT and Live Testing windows at a glance.</p></div></div>{error && <div className="people-alert">{error}</div>}<div className="gantt-filters"><label>Product<select value={productFilter} onChange={event => setProductFilter(event.target.value)}><option>All</option>{products.map(product => <option key={product.name} value={product.name}>{product.acronym} · {product.name}</option>)}</select></label><label>People<select value={personFilter} onChange={event => setPersonFilter(event.target.value)}><option>All</option>{people.map(person => <option key={person.id || person.name} value={String(person.id || person.name)}>{person.name}</option>)}</select></label><label>Priority<select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)}><option>All</option>{['P0', 'P1', 'P2', 'P3'].map(priority => <option key={priority}>{priority}</option>)}</select></label><button type="button" className="secondary-button compact" onClick={() => { setProductFilter('All'); setPersonFilter('All'); setPriorityFilter('All'); }}>Reset filters</button><span className="gantt-filter-count">{visibleFeatures.length} feature{visibleFeatures.length === 1 ? '' : 's'}</span></div>{loading ? <div className="people-empty">Loading feature timeline...</div> : <div className="gantt-shell"><div className="gantt-scroll"><div className="gantt-grid" style={{ '--gantt-days': totalDays }}><div className="gantt-corner"><span>FEATURE / PICs</span></div><div className="gantt-dates">{days.map((date, index) => <span className={date.toDateString() === today.toDateString() ? 'today' : ''} key={date.toISOString()}>{index === 0 || date.getDate() === 1 || date.getDay() === 1 ? timelineLabel(date) : ''}</span>)}</div>{visibleFeatures.length ? visibleFeatures.map(feature => { const pm = getPeople(feature, 'pmPicIds', 'pmPic'); const qa = getPeople(feature, 'qaPicIds', 'qaPic'); return <div className="gantt-feature-row" key={feature.id || feature.name}><div className="gantt-feature-label"><strong>{feature.name}</strong><small>PM {pm}</small><small>QA {qa}</small></div><div className="gantt-track"><div className="gantt-grid-lines" />{feature.uatStart || feature.uatEnd ? <span className="gantt-bar gantt-uat" style={position(feature.uatStart, feature.uatEnd)}><b>UAT</b><small>{feature.uatStatus || 'Planned'}</small></span> : null}{feature.liveStart || feature.liveEnd ? <span className="gantt-bar gantt-live" style={position(feature.liveStart, feature.liveEnd)}><b>LIVE</b><small>{feature.liveStatus || 'Planned'}</small></span> : null}</div></div>; }) : <div className="gantt-empty">No features match these filters.</div>}</div></div><div className="gantt-legend"><span><i className="legend-uat" />UAT</span><span><i className="legend-live" />Live Testing</span><span><i className="legend-today" />Today</span></div></div>}</section>;
}

function TimelineRow({ person, role, bars }) {
  const [initials, tone] = avatars[person];
  return <div className="timeline-row"><div className="person"><Avatar initials={initials} tone={tone} /><div><strong>{person}</strong><small>{role}</small></div></div>{[0, 1, 2, 3, 4].map(day => { const bar = bars.find(item => item[0] === day); return <div className="day-cell" key={day}>{bar && <span className={`bar ${bar[2]}`} style={{ width: bar[3] }}>{bar[1]}</span>}</div>; })}</div>;
}

function ReleasePanel() {
  return <div className="panel release-panel"><div className="panel-header"><div><p className="eyebrow">UP NEXT</p><h2>Release readiness</h2></div><span className="release-date">30 SEP</span></div><div className="release-feature"><div className="feature-icon">↗</div><div><strong>Credit limit increase</strong><small>6 of 8 tasks complete</small></div><div className="progress-ring"><span>75%</span></div></div><div className="release-footer"><span><span className="mini-dot green" />On track</span><button className="text-button">Open feature <span>→</span></button></div></div>;
}

function TaskModal({ onClose, onAdd }) {
  const submit = event => { event.preventDefault(); const data = new FormData(event.currentTarget); onAdd({ name: data.get('name'), feature: data.get('feature'), owner: data.get('owner') || 'Unassigned', status: 'todo', statusLabel: 'To do', due: new Date(`${data.get('due')}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() }); };
  return <div className="modal-backdrop" onClick={event => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div className="modal-header"><div><p className="eyebrow">WORK QUEUE</p><h2 id="modalTitle">Create a task</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div><form onSubmit={submit}><label>Task name<input name="name" required placeholder="e.g. Verify repayment schedule" autoFocus /></label><label>Feature<select name="feature"><option>Credit limit increase</option><option>Application onboarding</option><option>Statement history</option><option>Risk decisioning</option></select></label><div className="form-row"><label>Owner<input name="owner" defaultValue="Alex Kim" /></label><label>Due date<input name="due" type="date" defaultValue="2026-09-25" /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Add task</button></div></form></div></div>;
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState('');
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [featuresError, setFeaturesError] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFeatureSettingsModal, setShowFeatureSettingsModal] = useState(false);
  useEffect(() => {
    listPeople().then(setPeople).catch(error => setPeopleError(error.message)).finally(() => setPeopleLoading(false));
    listFeatures().then(setFeatures).catch(error => setFeaturesError(error.message)).finally(() => setFeaturesLoading(false));
    listProducts().then(setProducts).catch(error => setProductsError(error.message)).finally(() => setProductsLoading(false));
  }, []);
  const addTask = task => { setTasks(current => [task, ...current]); setShowModal(false); };
  const openAddPerson = () => { setEditingPerson(null); setShowPeopleModal(true); };
  const openEditPerson = person => { setEditingPerson(person); setShowPeopleModal(true); };
  const savePerson = async person => { try { const savedPerson = editingPerson ? await updatePerson(person) : await createPerson(person); setPeople(current => editingPerson ? current.map(item => (item.id && editingPerson.id ? item.id === editingPerson.id : item === editingPerson) ? savedPerson : item) : [...current, savedPerson]); setPeopleError(''); setShowPeopleModal(false); setEditingPerson(null); } catch (error) { setPeopleError(error.message); } };
  const removePerson = async person => { if (!window.confirm(`Remove ${person.name} from the team?`)) return; try { await deletePerson(person); setPeople(current => current.filter(item => item.id && person.id ? item.id !== person.id : item !== person)); setPeopleError(''); } catch (error) { setPeopleError(error.message); } };
  const openAddFeature = () => { setEditingFeature(null); setShowFeatureModal(true); };
  const openEditFeature = feature => { setEditingFeature(feature); setShowFeatureModal(true); };
    const saveFeature = async feature => { try { const savedFeature = editingFeature ? await updateFeature(feature) : await createFeature(feature); setFeatures(current => editingFeature ? current.map(item => item.id && editingFeature.id ? (item.id === editingFeature.id ? savedFeature : item) : item === editingFeature ? savedFeature : item) : [...current, savedFeature]); setFeaturesError(''); setShowFeatureModal(false); setEditingFeature(null); } catch (error) { setFeaturesError(error.message); } };
  const removeFeature = async feature => { if (!window.confirm(`Remove ${feature.name} from features?`)) return; try { await deleteFeature(feature); setFeatures(current => current.filter(item => item.id && feature.id ? item.id !== feature.id : item !== feature)); setFeaturesError(''); } catch (error) { setFeaturesError(error.message); } };
  const openAddProduct = () => { setEditingProduct(null); setShowProductModal(true); };
  const openEditProduct = product => { setEditingProduct(product); setShowProductModal(true); };
  const saveProduct = async product => { try { const savedProduct = editingProduct ? await updateProduct(product) : await createProduct(product); setProducts(current => editingProduct ? current.map(item => item.id === editingProduct.id ? savedProduct : item) : [...current, savedProduct]); setProductsError(''); setShowProductModal(false); setEditingProduct(null); } catch (error) { setProductsError(error.message); } };
  const removeProduct = async product => { if (!window.confirm(`Remove ${product.name} from the product list?`)) return; try { await deleteProduct(product); setProducts(current => current.filter(item => item.id && product.id ? item.id !== product.id : item !== product)); setProductsError(''); } catch (error) { setProductsError(error.message); } };
  if (activeView === 'timeline') return <div className="app-shell"><Sidebar activeView={activeView} setActiveView={setActiveView} taskCount={tasks.length + 18} /><main className="main-content"><header className="topbar"><div className="breadcrumbs"><span>Credit Platform</span><b>/</b><strong>Timeline</strong></div><div className="top-actions"><Avatar /></div></header><div className="page-wrap"><FeatureGanttPanel features={features} people={people} loading={featuresLoading} error={featuresError} /></div></main></div>;
  return <div className="app-shell"><Sidebar activeView={activeView} setActiveView={setActiveView} taskCount={tasks.length + 18} /><main className="main-content"><header className="topbar"><div className="breadcrumbs"><span>Credit Platform</span><b>/</b><strong>{activeView === 'overview' ? 'Overview' : activeView[0].toUpperCase() + activeView.slice(1)}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="icon-button" aria-label="Notifications">♢<i /></button><Avatar /></div></header><div className="page-wrap">{activeView === 'people' ? <PeoplePanel people={people} loading={peopleLoading} error={peopleError} onAdd={openAddPerson} onEdit={openEditPerson} onRemove={removePerson} /> : activeView === 'products' ? <ProductPanel products={products} loading={productsLoading} error={productsError} onAdd={openAddProduct} onEdit={openEditProduct} onRemove={removeProduct} /> : activeView === 'features' ? <FeaturePanel features={features} people={people} products={products} loading={featuresLoading} error={featuresError} onAdd={openAddFeature} onEdit={openEditFeature} onRemove={removeFeature} onOpenSettings={() => setShowFeatureSettingsModal(true)} /> : <><section className="page-heading"><div><p className="eyebrow">TUESDAY, 22 SEPTEMBER 2026</p><h1>Good morning, Alex <span>✳</span></h1><p className="subheading">Here’s what needs your attention across Credit Platform.</p></div><button className="primary-button" onClick={() => setShowModal(true)}><span>＋</span> New task</button></section><Metrics taskCount={tasks.length + 18} /><section className="content-grid"><TasksPanel tasks={tasks} setTasks={setTasks} activeView={activeView} setActiveView={setActiveView} /><div className="right-column"><TimelinePanel /><ReleasePanel /></div></section></>}</div></main>{showModal && <TaskModal onClose={() => setShowModal(false)} onAdd={addTask} />}{showPeopleModal && <PeopleModal person={editingPerson} onClose={() => { setShowPeopleModal(false); setEditingPerson(null); }} onSave={savePerson} />}{showFeatureModal && <FeatureModal feature={editingFeature} people={people} products={products} onClose={() => { setShowFeatureModal(false); setEditingFeature(null); }} onSave={saveFeature} />}{showProductModal && <ProductModal product={editingProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null); }} onSave={saveProduct} />}{showFeatureSettingsModal && <FeatureSettingsModal onClose={() => setShowFeatureSettingsModal(false)} />}</div>;
}
