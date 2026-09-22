import { useState } from 'react';
import { peopleRoles } from '../config.js';
import Avatar from '../components/Avatar.jsx';

export default function PeoplePanel({ people, loading, error, onAdd, onEdit, onRemove }) {
  const [roleFilter, setRoleFilter] = useState('All');
  const roles = ['All', ...peopleRoles];
  const visiblePeople = roleFilter === 'All' ? people : people.filter(person => person.role === roleFilter);

  return <section className="people-view"><div className="people-heading"><div><p className="eyebrow">TEAM CONFIGURATION</p><h1>Team members</h1><p className="subheading">Configure the people who can own PM and QA work.</p></div><button className="primary-button" onClick={onAdd}><span>＋</span> Add member</button></div>{error && <div className="people-alert">{error}</div>}<div className="people-toolbar"><div><h2>Configured members</h2><small>{loading ? 'Loading members...' : `${people.length} members in this workspace`}</small></div><div className="filter-group">{roles.map(role => <button key={role} className={`filter-button ${roleFilter === role ? 'active' : ''}`} onClick={() => setRoleFilter(role)}>{role}</button>)}</div></div>{loading ? <div className="people-empty">Loading team members...</div> : <div className="people-list">{visiblePeople.map(person => <article className="person-card" key={person.id || person.name}><div className="person-card-top"><Avatar initials={person.initials} tone={person.tone} /><div className="person-details"><strong>{person.name}</strong><span className="inline-role">{person.role}</span></div><div className="person-actions"><button className="secondary-button compact" onClick={() => onEdit(person)}>Edit</button><button className="icon-button person-more" onClick={() => onRemove(person)} aria-label={`Remove ${person.name}`}>×</button></div></div><div className="person-focus"><span>FOCUS AREA</span><strong>{person.focus}</strong></div></article>)}</div>}</section>;
}
