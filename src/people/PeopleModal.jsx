import { peopleRoles } from '../config.js';

export default function PeopleModal({ person, onClose, onSave }) {
  const submit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name');
    const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
    onSave({ ...(person || {}), name, role: data.get('role'), initials, tone: person?.tone || 'avatar-orange', focus: data.get('focus') || 'Credit Platform' });
  };

  return <div className="modal-backdrop" onClick={event => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="personModalTitle"><div className="modal-header"><div><p className="eyebrow">TEAM CONFIGURATION</p><h2 id="personModalTitle">{person ? 'Edit member' : 'Add member'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div><form onSubmit={submit}><label>Full name<input name="name" required defaultValue={person?.name || ''} placeholder="e.g. Jordan Lee" autoFocus /></label><label>Role<select name="role" defaultValue={person?.role || peopleRoles[0]}>{peopleRoles.map(role => <option key={role}>{role}</option>)}</select></label><label>Focus area<input name="focus" defaultValue={person?.focus || ''} placeholder="e.g. Credit limit increase" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Save member</button></div></form></div></div>;
}
