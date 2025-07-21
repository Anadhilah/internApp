import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Briefcase, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import NotificationBell from '../common/NotificationBell';
import ThemeToggle from '../common/ThemeToggle';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-indigo-600 font-medium' : 'text-gray-700 hover:text-indigo-600';
  };

  const getNavItems = () => {
    if (!user) {
      return (
        <>
          <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
            Home
          </Link>
          <Link
            to="/signup"
            className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </Link>
        </>
      );
    }

    if (user.role === 'organization') {
      return (
        <>
          <Link to="/organization/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/organization/dashboard')}`}>
            Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="ml-4 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Sign Out
          </button>
        </>
      );
    }

    // Intern navigation
    return (
      <>
        <Link to="/internships" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/internships')}`}>
          Internships
        </Link>
        <Link to="/applications" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/applications')}`}>
          My Applications
        </Link>
        <Link to="/profile" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}>
          Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign Out
        </button>
      </>
    );
  };

  const getMobileNavItems = () => {
    if (!user) {
      return (
        <>
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/signup"
            className="mt-2 block w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      );
    }

    if (user.role === 'organization') {
      return (
        <>
          <Link
            to="/organization/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/organization/dashboard')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full px-4 py-2 text-base font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Sign Out
          </button>
        </>
      );
    }

    // Intern mobile navigation
    return (
      <>
        <Link
          to="/internships"
          className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/internships')}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Internships
        </Link>
        <Link
          to="/applications"
          className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/applications')}`}
          onClick={() => setIsMenuOpen(false)}
        >
          My Applications
        </Link>
        <Link
          to="/profile"
          className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile')}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="mt-2 w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign Out
        </button>
      </>
    );
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">InternLink</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && <NotificationBell />}
            <ThemeToggle />
            {getNavItems()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && (
              <div className="flex justify-center mb-4">
                <NotificationBell />
              </div>
            )}
            {getMobileNavItems()}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;