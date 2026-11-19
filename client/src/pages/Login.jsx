import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateAuthForm } from '../utils/validation.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'Admin' ? '/admin' : '/'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateAuthForm(values, 'login');
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError(null);
    try {
      const loggedIn = await login(values);
      // Role-based redirect; customers return to where they were headed.
      navigate(loggedIn.role === 'Admin' ? '/admin' : location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <main className="container">
      <form className="panel auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Log in</h1>
        <ErrorMessage error={error} />
        <Field label="Email" type="email" autoComplete="email" value={values.email} error={errors.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
        <Field label="Password" type="password" autoComplete="current-password" value={values.password} error={errors.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
        <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted" style={{ marginTop: '1rem' }}>New here? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
