import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Search,
  ChevronDown,
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  Briefcase,
  ShoppingBag,
  Home,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './ProfileDropdownMicrointeractions.css';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Enhanced scroll detection with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile and notifications
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchNotificationCount();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchNotificationCount = async () => {
    if (!user) return;
    
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotificationCount(count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        setIsUserMenuOpen(false);
      }
      if (!target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Articles', path: '/articles', icon: BookOpen },
    { name: 'Dentists', path: '/dentists', icon: Users },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Forum', path: '/forum', icon: MessageSquare },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Products', path: '/products', icon: ShoppingBag },
  ];

  const getDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      {/* Premium Navbar */}
      <nav className={`navbar-premium ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <span className="text-white font-bold text-lg">DR</span>
            </div>
            <span className="navbar-logo-text">DentalReach</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`navbar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button className="p-2 rounded-lg text-slate-600 hover:text-dental-600 hover:bg-dental-50/50 transition-all duration-300 icon-hover">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-slate-600 hover:text-dental-600 hover:bg-dental-50/50 transition-all duration-300 icon-hover"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="notification-badge">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative user-dropdown-container">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-dental-50/50 transition-all duration-300 group"
                  >
                    <div className="relative">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt={getDisplayName()}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-dental-600 to-dental-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {getInitials()}
                        </div>
                      )}
                      {userProfile?.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-semibold text-slate-700 group-hover:text-dental-600 transition-colors">
                        {getDisplayName()}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {userProfile?.role || 'Member'}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  <div className={`user-dropdown ${isUserMenuOpen ? 'open' : ''}`}>
                    <div className="p-4 border-b border-slate-100">
                      <div className="font-semibold text-slate-900">{getDisplayName()}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                      {userProfile?.specialty && (
                        <div className="text-xs text-dental-600 mt-1">{userProfile.specialty}</div>
                      )}
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="user-dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="user-dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/articles"
                          className="user-dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to="/submit"
                        className="user-dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Plus className="w-4 h-4 mr-3" />
                        Submit Content
                      </Link>
                    </div>
                    
                    <div className="border-t border-slate-100 py-2">
                      <button
                        onClick={handleSignOut}
                        className="user-dropdown-item text-red-600 hover:text-red-700 hover:bg-red-50/70 w-full text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="navbar-auth">
                <Link to="/login" className="navbar-login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="navbar-signup-btn">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} />

        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''} mobile-menu-container`}>
          <div className="mobile-menu-content">
            {/* Mobile Menu Header */}
            <div className="mobile-menu-header">
              <div className="flex items-center space-x-3">
                <div className="navbar-logo-icon">
                  <span className="text-white font-bold">DR</span>
                </div>
                <span className="navbar-logo-text">DentalReach</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="mobile-menu-nav">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                               (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-menu-link mobile-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Section */}
            {user ? (
              <div className="mobile-menu-item">
                <div className="bg-dental-50/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={getDisplayName()}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-dental-600 to-dental-700 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{getDisplayName()}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-white/70 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-white/70 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50/70 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mobile-menu-auth">
                <Link
                  to="/login"
                  className="mobile-menu-login mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="mobile-menu-signup mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dental-600/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="navbar-logo-icon">
                  <span className="text-white font-bold text-lg">DR</span>
                </div>
                <span className="text-2xl font-bold text-white">DentalReach</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
                Empowering dental professionals worldwide through knowledge sharing, 
                collaboration, and continuous learning in the digital age.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-white">📧</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-white">🐦</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-white">💼</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Platform</h3>
              <ul className="space-y-3 text-slate-300">
                <li><Link to="/articles" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Articles & Research</Link></li>
                <li><Link to="/dentists" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Expert Dentists</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Events & Webinars</Link></li>
                <li><Link to="/forum" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Community Forum</Link></li>
                <li><Link to="/jobs" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Career Opportunities</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-3 text-slate-300">
                <li><Link to="/about" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Privacy Policy</Link></li>
                <li><a href="mailto:support@dentalreach.com" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Contact Support</a></li>
                <li><Link to="/help" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Help Center</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; 2025 DentalReach. All rights reserved. Built with ❤️ for dental professionals.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Made with modern web technologies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;