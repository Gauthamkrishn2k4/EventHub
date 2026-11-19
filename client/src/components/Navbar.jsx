import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to={isAdmin ? '/admin' : '/'} className="brand">EventHub</Link>
        <NavLink to="/" end>Events</NavLink>
        {user?.role === 'Customer' && <NavLink to="/my-bookings">My bookings</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <>
            <span className="navbar__user">{user.name} ({user.role})</span>
            <button className="btn btn--small btn--ghost" onClick={onLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link className="btn btn--small" to="/register">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
