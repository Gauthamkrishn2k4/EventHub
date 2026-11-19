import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateAuthForm } from '../utils/validation.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const bind = (name) => ({ value: values[name], error: errors[name], onChange: (e) => setValues({ ...values, [name]: e.target.value }) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateAuthForm(values, 'register');
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError(null);
    try {
      await register(values); // role is never sent: the server always creates Customers
      navigate('/', { replace: true });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <main className="container">
      <form className="panel auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>
        <ErrorMessage error={error} />
        <Field label="Name" autoComplete="name" {...bind('name')} />
        <Field label="Email" type="email" autoComplete="email" {...bind('email')} />
        <Field label="Password" type="password" autoComplete="new-password" {...bind('password')} />
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="muted" style={{ marginTop: '1rem' }}>Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
