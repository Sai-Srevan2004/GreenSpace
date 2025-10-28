import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items based on user role
  const getMenuItems = () => {
    if (!isAuthenticated) {
      return [
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register', isButton: true },
      ];
    }

    switch (user?.role) {
      case 'gardener':
        return [
          { to: '/plots', label: 'Browse Plots' },
          { to: '/gardener/bookings', label: 'My Bookings' },
        ];

      case 'landowner':
        return [
          { to: '/landowner/plots', label: 'My Plots' },
          { to: '/landowner/bookings', label: 'Bookings' },
        ];

      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard' },
          { to: '/plots', label: 'All Plots' },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav
      className="shadow-md border-b"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <svg
                className="w-8 h-8"
                style={{ color: 'var(--color-primary)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span
                className="text-2xl font-bold tracking-wide"
                style={{ color: 'var(--color-primary)' }}
              >
                GreenSpace
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-4">
            {menuItems.map((item) =>
              item.isButton ? (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-4 py-2 rounded-md text-sm font-medium transition"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = 'var(--color-secondary)')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = 'var(--color-primary)')
                  }
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-text)' }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = 'var(--color-primary)')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = 'var(--color-text)')
                  }
                >
                  {item.label}
                </Link>
              )
            )}

            {/* Authenticated user info + Logout */}
            {isAuthenticated && (
              <div className="flex items-center space-x-3 pl-2 border-l border-(var(--color-secondary))/30">
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  {user?.name}
                  <span
                    className="ml-1 text-xs"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    ({user?.role})
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium transition"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = 'var(--color-secondary)')
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = 'var(--color-primary)')
                  }
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
