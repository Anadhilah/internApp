import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatButton from '../chat/ChatButton';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect based on user role and authentication
  React.useEffect(() => {
    const publicPaths = ['/', '/signup', '/signup/intern', '/signup/organization'];
    
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate('/');
    } else if (user) {
      // Redirect organization users to their dashboard
      if (user.role === 'organization' && location.pathname === '/') {
        navigate('/organization/dashboard');
      }
      // Redirect intern users away from organization routes
      else if (user.role === 'intern' && location.pathname.startsWith('/organization')) {
        navigate('/internships');
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {user && <ChatButton />}
    </div>
  );
};

export default Layout;