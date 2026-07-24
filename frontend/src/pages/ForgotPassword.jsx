import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      if (data.devResetToken) setDevToken(data.devResetToken);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="blob w-72 h-72 bg-amber -top-10 -right-16 animate-blob" />

      <div className="w-full max-w-sm relative z-10 animate-fadeUp">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-violet tracking-widest uppercase mb-2">Recover access</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Reset your password</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl2 p-7 space-y-4 shadow-soft">
          {message && (
            <div className="text-sm text-ink bg-canvas border border-line rounded-lg px-3 py-2 animate-pop">
              {message}
            </div>
          )}
          {devToken && (
            <div className="text-xs text-amber bg-amber-soft border border-amber/25 rounded-lg px-3 py-2 break-all animate-pop">
              Dev mode (no email service wired up) — reset link:
              <br />
              <Link to={`/reset-password/${devToken}`} className="underline">
                /reset-password/{devToken}
              </Link>
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
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-violet text-white font-semibold text-sm py-3 rounded-lg hover:bg-violet-dark hover:shadow-lift transition-all disabled:opacity-50 focus-ring"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
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

export default ForgotPassword;
