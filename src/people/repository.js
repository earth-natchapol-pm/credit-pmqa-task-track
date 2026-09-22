import { initialPeople } from './data.js';
import { hasSupabaseConfig, supabase } from '../lib/supabase.js';

const mapMember = member => ({
  id: member.id,
  name: member.name,
  role: member.role,
  focus: member.focus_area,
  initials: member.initials,
  tone: member.tone,
});

export async function listPeople() {
  if (!hasSupabaseConfig) return initialPeople;
  const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapMember);
}

export async function createPerson(person) {
  if (!hasSupabaseConfig) return person;
  const { data, error } = await supabase.from('team_members').insert({ name: person.name, role: person.role, focus_area: person.focus, initials: person.initials, tone: person.tone }).select().single();
  if (error) throw error;
  return mapMember(data);
}

export async function updatePerson(person) {
  if (!hasSupabaseConfig) return person;
  const { data, error } = await supabase.from('team_members').update({ name: person.name, role: person.role, focus_area: person.focus, initials: person.initials }).eq('id', person.id).select().single();
  if (error) throw error;
  return mapMember(data);
}

export async function deletePerson(person) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.from('team_members').delete().eq('id', person.id);
  if (error) throw error;
}
