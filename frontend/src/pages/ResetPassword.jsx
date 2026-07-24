import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed - the link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="blob w-72 h-72 bg-violet -bottom-16 -left-10 animate-blob" />

      <div className="w-full max-w-sm relative z-10 animate-fadeUp">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-violet tracking-widest uppercase mb-2">New credential</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Choose a new password</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl2 p-7 space-y-4 shadow-soft">
          {error && (
            <div className="text-sm text-coral bg-coral-soft border border-coral/20 rounded-lg px-3 py-2 animate-pop">
              {error}
            </div>
          )}
          {done ? (
            <div className="text-sm text-mint bg-mint-soft border border-mint/25 rounded-lg px-3 py-2 animate-pop">
              Password updated — redirecting to sign in…
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">New password</label>
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
                {submitting ? 'Updating…' : 'Update password'}
              </button>
            </>
          )}
          <p className="text-center text-xs pt-1">
            <Link to="/login" className="text-muted hover:text-violet transition-colors">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
