import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="blob w-72 h-72 bg-violet -top-10 -left-10 animate-blob" />
      <div className="blob w-64 h-64 bg-mint bottom-0 right-0 animate-blob" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-sm relative z-10 animate-fadeUp">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-violet tracking-widest uppercase mb-2">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Sign in to Vault</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl2 p-7 space-y-4 shadow-soft">
          {error && (
            <div className="text-sm text-coral bg-coral-soft border border-coral/20 rounded-lg px-3 py-2 animate-pop">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-violet text-white font-semibold text-sm py-3 rounded-lg hover:bg-violet-dark hover:shadow-lift transition-all disabled:opacity-50 focus-ring"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="flex justify-between text-xs pt-1">
            <Link to="/forgot-password" className="text-muted hover:text-violet transition-colors">
              Forgot password?
            </Link>
            <Link to="/register" className="text-muted hover:text-violet transition-colors">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
