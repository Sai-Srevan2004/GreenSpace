import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[var(--text-dark)] mb-4">
            Welcome to <span className="text-[var(--primary)]">GreenSpace</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Connecting landowners with gardening enthusiasts to transform unused plots
            into productive green spaces. Promoting sustainable urban agriculture and
            community well-being.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'List Your Land',
              text: 'Landowners can list unused plots with details like location, size, soil type, and water availability',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              )
            },
            {
              title: 'Find Perfect Plot',
              text: 'Gardeners can search, filter, and book suitable plots through an interactive interface',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              )
            },
            {
              title: 'Verified & Safe',
              text: 'Admin verification ensures all landowners and plots are authentic with proper documentation',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              )
            },
          ].map((card, i) => (
            <div key={i} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.icon}
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-dark)] mb-2 text-center">{card.title}</h3>
              <p className="text-gray-600 text-center">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          {isAuthenticated ? (
            <Link
              to={
                user?.role === 'gardener'
                  ? '/plots'
                  : user?.role === 'landowner'
                  ? '/landowner/plots'
                  : '/admin'
              }
              className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-8 py-3 rounded-lg text-lg font-semibold transition inline-block"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-8 py-3 rounded-lg text-lg font-semibold transition inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold transition inline-block"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[var(--text-dark)] mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {['Register', 'Get Verified', 'List or Browse', 'Start Growing'].map((step, i) => (
              <div key={i} className="text-center">
                <div className="bg-[var(--primary)] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {i + 1}
                </div>
                <h4 className="font-semibold mb-2">{step}</h4>
                <p className="text-sm text-gray-600">
                  {i === 0
                    ? 'Sign up as a landowner or gardener'
                    : i === 1
                    ? 'Upload documents for admin verification'
                    : i === 2
                    ? 'List your plot or find suitable land'
                    : 'Begin your community gardening journey'}
                </p>
              </div>
            ))}
          </div>

          {/* ✅ NEW NOTE ADDED HERE */}
          <p className="text-center text-sm text-gray-600 mt-8 max-w-2xl mx-auto italic">
            Note: GreenSpace only serves as a connection platform between landowners and gardeners. 
            All communication, negotiation, and coordination happen directly through the contact details provided 
            by the users. The platform does not facilitate in-app messaging.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
