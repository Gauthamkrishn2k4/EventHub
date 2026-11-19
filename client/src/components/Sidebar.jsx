import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/bookings', label: 'Bookings' },
];

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Admin">
      {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>)}
    </nav>
  );
}
