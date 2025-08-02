import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X,
  LogIn,
  BarChart3
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    { name: 'Hjem', href: '/', icon: Home },
    { name: 'Søk jobber', href: '/jobs', icon: Search },
  ];

  const authenticatedNavigation = [
    ...navigation,
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Publiser jobb', href: '/jobs/new', icon: Plus },
    { name: 'Meldinger', href: '/messages', icon: MessageCircle },
  ];

  const currentNavigation = currentUser ? authenticatedNavigation : navigation;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">UngService</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications - only show if logged in */}
            {currentUser && <NotificationDropdown />}

            {/* User Menu or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {currentUser.photoURL ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">
                    {currentUser.displayName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Min profil
                    </Link>
                    <Link
                      to="/notifications/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Varselinnstillinger
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logg ut
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Logg inn
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  Registrer deg
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            {!currentUser && (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    to="/login"
                    className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5 mr-3" />
                    Logg inn
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Registrer deg
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 