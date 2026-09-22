export default function Avatar({ initials = 'AK', tone = 'avatar-orange' }) {
  return <span className={`avatar ${tone}`}>{initials}</span>;
}
