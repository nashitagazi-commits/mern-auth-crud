import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display font-semibold text-lg text-ink tracking-tight">
          vault<span className="text-violet">.</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-mint" />
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium px-3.5 py-2 rounded-full border border-line text-muted hover:border-coral hover:text-coral hover:bg-coral-soft transition-colors focus-ring"
            >
              End session
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
