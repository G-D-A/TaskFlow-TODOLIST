import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login, register } from './api/auth.js';
import TaskDashboard from './TaskDashboard.jsx';
import './styles/app.css';

function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.';
}

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    // A malformed local value should not prevent the application from starting.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useMutation({
    mutationFn: mode === 'login' ? login : register,
    onSuccess: onAuthenticated,
  });
  const isLogin = mode === 'login';

  function switchMode(nextMode) {
    setMode(nextMode);
    setPassword('');
    mutation.reset();
  }

  function handleSubmit(event) {
    event.preventDefault();
    mutation.mutate({ email, password });
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="brand">TaskFlow</div>
      <div className="auth-heading">
        <p className="eyebrow">Personal task manager</p>
        <h1 id="auth-title">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p>{isLogin ? 'Sign in to manage your tasks.' : 'Start organizing your work in one place.'}</p>
      </div>
      <div className="mode-switch" role="tablist" aria-label="Authentication mode">
        <button className={isLogin ? 'active' : ''} onClick={() => switchMode('login')} type="button">Sign in</button>
        <button className={!isLogin ? 'active' : ''} onClick={() => switchMode('register')} type="button">Register</button>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength="6" required />
        </label>
        {mutation.isError && <p className="form-error" role="alert">{getErrorMessage(mutation.error)}</p>}
        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(getSavedUser);

  useEffect(() => {
    const signOutAfterExpiredToken = () => setUser(null);
    window.addEventListener('auth:expired', signOutAfterExpiredToken);
    return () => window.removeEventListener('auth:expired', signOutAfterExpiredToken);
  }, []);

  function handleAuthenticated({ token, user: authenticatedUser }) {
    // Persist the session so a browser refresh keeps the user signed in.
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  }

  function handleLogout() {
    // Removing both values returns the application to the authentication screen.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return <main className="app-shell">{user ? <TaskDashboard user={user} onLogout={handleLogout} /> : <AuthForm onAuthenticated={handleAuthenticated} />}</main>;
}

export default App;
