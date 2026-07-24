import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const passwordChecks = (pw) => ({
  length: pw.length >= 8,
  number: /\d/.test(pw),
});

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const checks = passwordChecks(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="blob w-72 h-72 bg-mint -top-16 -right-10 animate-blob" />
      <div className="blob w-64 h-64 bg-amber bottom-0 -left-10 animate-blob" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-sm relative z-10 animate-fadeUp">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-violet tracking-widest uppercase mb-2">Get started</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl2 p-7 space-y-4 shadow-soft">
          {error && (
            <div className="text-sm text-coral bg-coral-soft border border-coral/20 rounded-lg px-3 py-2 animate-pop">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-canvas border border-line rounded-lg px-3.5 py-2.5 text-ink text-sm focus-ring focus:border-violet outline-none transition-colors"
              placeholder="Jane Doe"
            />
          </div>
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
            <div className="flex gap-3 mt-2 text-[11px]">
              <span className={`transition-colors ${checks.length ? 'text-mint font-medium' : 'text-muted'}`}>
                {checks.length ? '✓' : '○'} 8+ characters
              </span>
              <span className={`transition-colors ${checks.number ? 'text-mint font-medium' : 'text-muted'}`}>
                {checks.number ? '✓' : '○'} a number
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-violet text-white font-semibold text-sm py-3 rounded-lg hover:bg-violet-dark hover:shadow-lift transition-all disabled:opacity-50 focus-ring"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
          <p className="text-center text-xs pt-1">
            <Link to="/login" className="text-muted hover:text-violet transition-colors">
              Already have an account? Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
