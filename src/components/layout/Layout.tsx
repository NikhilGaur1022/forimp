// For safely storing a timeout on the window object (for user menu hover delay)
declare global {
  interface Window { userMenuTimeout?: ReturnType<typeof setTimeout>; }
}
import { Outlet, Link, useNavigate } from 'react-router-dom';
// import { Player } from '@lordicon/react';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, Bell, Plus, CheckCircle, ShieldCheck, Briefcase} from 'lucide-react';
import { motion } from 'framer-motion';
import './ProfileDropdownMicrointeractions.css';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  full_name: string | null;
  email: string | null;
  is_verified: boolean;
}

const Layout = () => {
  // Track scroll position for navbar capsule effect
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Scroll detection for capsule effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, is_verified')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to user email
        setUserProfile({ full_name: null, email: user.email ?? null, is_verified: false });
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setUnreadNotifications(0);
        return;
      }

      try {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        setUnreadNotifications(count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    if (user) {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}` 
          }, 
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Articles', href: '/articles' },
  // { name: 'Journals', href: '/journals' }, // Removed Journals from navbar
  { name: 'Forum', href: '/forum' },
  { name: 'Events', href: '/events' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Products', href: '/products' },
  { name: 'Dentists', href: '/dentists' },
  { name: 'About', href: '/about' },
];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Bell swing animation for notification icon */}
      <style>{`
        @keyframes bell-swing {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(-18deg); }
          20% { transform: rotate(14deg); }
          30% { transform: rotate(-10deg); }
          40% { transform: rotate(7deg); }
          50% { transform: rotate(-4deg); }
          60% { transform: rotate(2deg); }
          70% { transform: rotate(-1deg); }
          80% { transform: rotate(0.5deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-swing-on-hover:hover .bell-icon {
          animation: bell-swing 0.8s cubic-bezier(.36,1.56,.64,1) 1;
          transform-origin: 50% 0%;
        }
        .bell-icon {
          display: inline-block;
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar-premium ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo - Hidden when scrolled */}
          {!scrolled && (
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <span className="text-white font-extrabold text-xl tracking-widest select-none">DR</span>
              </div>
              <span className="navbar-logo-text">
                Dental<span className="text-dental-500">Reach</span>
              </span>
            </Link>
          )}

            {/* Desktop Navigation */}
            <div className="navbar-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`navbar-link ${window.location.pathname === link.href ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* User Menu / Auth Buttons - Only show when not scrolled */}
            {!scrolled && (
              <div className="navbar-auth">
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-4">
                    {/* Notifications Bell */}
                    <div className="relative flex items-center">
                      <Link 
                        to="/notifications"
                        className="p-2 text-slate-500 hover:text-dental-600 transition-all duration-300 inline-flex items-center justify-center rounded-lg hover:bg-dental-50/70 icon-hover"
                      >
                        <Bell className="h-5 w-5" />
                        {unreadNotifications > 0 && (
                          <span className="notification-badge">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* User Dropdown - hover/click, animated, matches floating bubble UX */}
                    <div
                      className="relative group"
                      onMouseEnter={() => {
                        if (window.userMenuTimeout) clearTimeout(window.userMenuTimeout);
                        setIsUserMenuOpen(true);
                      }}
                      onMouseLeave={() => {
                        window.userMenuTimeout = setTimeout(() => setIsUserMenuOpen(false), 220);
                      }}
                    >
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-500/50 p-2 hover:bg-dental-50/70 transition-all duration-300"
                        aria-haspopup="true"
                        aria-expanded={isUserMenuOpen}
                      >
                        <div className="w-8 h-8 rounded-full bg-dental-100 flex items-center justify-center">
                          <span className="text-dental-600 font-medium text-sm">
                            {getInitials()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-neutral-700">
                            {getDisplayName()}
                          </span>
                        </div>
                      </button>

                      {/* User Dropdown Menu - animated, tactile, staggered */}
                      <div
                        className={`user-dropdown ${isUserMenuOpen ? 'open' : ''}`}
                        onMouseEnter={() => {
                          if (window.userMenuTimeout) clearTimeout(window.userMenuTimeout);
                          setIsUserMenuOpen(true);
                        }}
                        onMouseLeave={() => {
                          window.userMenuTimeout = setTimeout(() => setIsUserMenuOpen(false), 220);
                        }}
                      >
                        <div className="px-4 py-3 border-b border-slate-200/60">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-neutral-900">
                              {getDisplayName()}
                            </p>
                          </div>
                          <p className="text-xs text-neutral-500 truncate">
                            {userProfile?.email || user.email}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <Link
                            to="/profile"
                            className="user-dropdown-item profile-btn-trigger"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/cniwvohj.json"
                              trigger="hover"
                              target=".profile-btn-trigger"
                              style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                            />
                            Profile
                          </Link>
                  <Link
                    to="/submit"
                    className="user-dropdown-item submit-btn-trigger"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <lord-icon
                      src="https://cdn.lordicon.com/gzqofmcx.json"
                      trigger="hover"
                      target=".submit-btn-trigger"
                      style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                    />
                    Submit Article
                          </Link>
                          {userProfile?.is_verified && (
                            <Link
                              to="/jobs/create"
                              className="user-dropdown-item postjob-btn-trigger"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <lord-icon
                                src="https://cdn.lordicon.com/qlpudrww.json"
                                trigger="hover"
                                target=".postjob-btn-trigger"
                                style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                              />
                              Post Job
                            </Link>
                          )}
                          {!userProfile?.is_verified && (
                            <Link
                              to="/verification/apply"
                              className="user-dropdown-item getverified-btn-trigger"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <lord-icon
                                src="https://cdn.lordicon.com/rxgzsafd.json"
                                trigger="hover"
                                target=".getverified-btn-trigger"
                                style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                              />
                              Get Verified
                            </Link>
                          )}
                          {isAdmin && (
                            <>
                              <Link
                                to="/admin/articles"
                                className="user-dropdown-item managearticles-btn-trigger"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <lord-icon
                                  src="https://cdn.lordicon.com/cfkiwvcc.json"
                                  trigger="hover"
                                  target=".managearticles-btn-trigger"
                                  style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                                />
                                Manage Articles
                              </Link>
                              <Link
                                to="/admin/verifications"
                                className="user-dropdown-item manageverifications-btn-trigger"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <lord-icon
                                  src="https://cdn.lordicon.com/asyunleq.json"
                                  trigger="hover"
                                  target=".manageverifications-btn-trigger"
                                  style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                                />
                                Manage Verifications
                              </Link>
                            </>
                          )}
                        </div>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="user-dropdown-item logout-btn-trigger w-full text-left"
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/ircnfpus.json"
                            trigger="hover"
                            target=".logout-btn-trigger"
                            style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                          />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="navbar-login-btn"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="navbar-signup-btn"
                    >
                      Sign up
                    </Link>
                  </div>
                )}

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
                  aria-label="Open menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}

            {/* Mobile menu button when scrolled */}
            {scrolled && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`mobile-menu-btn fixed top-3 left-6 z-50 ${isMobileMenuOpen ? 'open' : ''}`}
                aria-label="Open menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <>
              <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
              <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                  <div className="mobile-menu-header">
                    <span className="navbar-logo-text text-lg">DentalReach</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <nav className="mobile-menu-nav">
                    {navLinks.map((link, index) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={`mobile-menu-link mobile-menu-item ${window.location.pathname === link.href ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ transitionDelay: `${(index + 1) * 0.05}s` }}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                  
                  {isAuthenticated && user ? (
                    <div className="mobile-menu-auth">
                      <div className="mobile-menu-item px-4 py-3 border-b border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-dental-100 rounded-full flex items-center justify-center">
                            <span className="text-dental-600 font-medium text-sm">
                              {getInitials()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {getDisplayName()}
                            </p>
                            <p className="text-xs text-slate-500">
                              {userProfile?.email || user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="mobile-menu-link mobile-menu-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/submit"
                        className="mobile-menu-link mobile-menu-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Submit Article
                      </Link>
                      {userProfile?.is_verified && (
                        <Link
                          to="/jobs/create"
                          className="mobile-menu-link mobile-menu-item"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Post Job
                        </Link>
                      )}
                      {!userProfile?.is_verified && (
                        <Link
                          to="/verification/apply"
                          className="mobile-menu-link mobile-menu-item"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Get Verified
                        </Link>
                      )}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/articles"
                            className="mobile-menu-link mobile-menu-item"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Manage Articles
                          </Link>
                          <Link
                            to="/admin/verifications"
                            className="mobile-menu-link mobile-menu-item"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Manage Verifications
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="mobile-menu-link mobile-menu-item w-full text-left"
                      >
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <div className="mobile-menu-auth">
                      <Link
                        to="/login"
                        className="mobile-menu-login mobile-menu-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="mobile-menu-signup mobile-menu-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-4 py-3 rounded-xl text-base font-semibold text-dental-700/90 transition-all duration-200 ease-in-out
                    hover:bg-dental-100 hover:text-dental-700 hover:shadow-md
                    focus:outline-none focus:ring-2 focus:ring-dental-400 focus:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated && user && (
                <>
                  <hr className="my-2" />
                  <div className="px-3 py-2">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-neutral-900">
                        {getDisplayName()}
                      </p>
                      {/* Verified tick beside name removed as per new design. */}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {userProfile?.email || user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/submit"
                    className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Submit Article
                  </Link>
                  {userProfile?.is_verified && (
                    <Link
                      to="/jobs/create"
                      className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  )}
                  {!userProfile?.is_verified && (
                    <Link
                      to="/verification/apply"
                      className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Verified
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/articles"
                        className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Manage Articles
                      </Link>
                      <Link
                        to="/admin/verifications"
                        className="block px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Manage Verifications
                      </Link>
                    </>
                  )}
                  {/* Profile link removed as per new dropdown cleanup */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 text-neutral-700 hover:text-dental-600 font-medium"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          )}
      </nav>

      {/* Floating User Bubble - Only show when scrolled and authenticated */}
      {scrolled && isAuthenticated && user && (
        <div className={`fixed top-3 right-6 z-50 transition-all duration-500 ease-in-out transform
          ${scrolled ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-8'}
        `}>
          <div className="flex items-center space-x-6 bg-white/80 backdrop-blur-lg rounded-full shadow-xl border border-neutral-200 px-4 py-3 h-16 min-h-16">
            {/* Notifications Bell (custom animated, same as default state) */}
            <div className="relative flex items-center">
              <Link 
                to="/notifications"
                className="p-2 text-neutral-500 hover:text-dental-600 transition-colors inline-flex items-center justify-center rounded-full hover:bg-dental-50 bell-swing-on-hover"
              >
                <Bell className="h-5 w-5 bell-icon" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </Link>
            </div>

            {/* User Avatar */}
            <div
              className="relative group"
              onMouseEnter={() => {
                if (window.userMenuTimeout) clearTimeout(window.userMenuTimeout);
                setIsUserMenuOpen(true);
              }}
              onMouseLeave={() => {
                window.userMenuTimeout = setTimeout(() => setIsUserMenuOpen(false), 220);
              }}
            >
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-500 p-1 hover:bg-dental-50 transition-colors"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-dental-100 flex items-center justify-center">
                  <span className="text-dental-600 font-medium text-sm">
                    {getInitials()}
                  </span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-neutral-200 transition-all duration-300 ease-out
                  ${isUserMenuOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}
                style={{ willChange: 'transform, opacity' }}
                onMouseEnter={() => {
                  if (window.userMenuTimeout) clearTimeout(window.userMenuTimeout);
                  setIsUserMenuOpen(true);
                }}
                onMouseLeave={() => {
                  window.userMenuTimeout = setTimeout(() => setIsUserMenuOpen(false), 220);
                }}
              >
                <div className="px-4 py-2 border-b border-neutral-100 transition-all duration-300 delay-75">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-neutral-900">
                      {getDisplayName()}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    {userProfile?.email || user.email}
                  </p>
                </div>
                <div className="flex flex-col">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-all duration-200 delay-100 profile-btn-trigger"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <lord-icon
                      src="https://cdn.lordicon.com/cniwvohj.json"
                      trigger="hover"
                      target=".profile-btn-trigger"
                      style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                    />
                    Profile
                  </Link>
                  <Link
                    to="/submit"
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-all duration-200 delay-150 group submit-btn-trigger"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <lord-icon
                      src="https://cdn.lordicon.com/gzqofmcx.json"
                      trigger="hover"
                      target=".submit-btn-trigger"
                      style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                    />
                    Submit Article
                  </Link>
                  {userProfile?.is_verified && (
                    <Link
                      to="/jobs/create"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-all duration-200 delay-200 postjob-btn-trigger"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <lord-icon
                        src="https://cdn.lordicon.com/qlpudrww.json"
                        trigger="hover"
                        target=".postjob-btn-trigger"
                        style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                      />
                      Post Job
                    </Link>
                  )}
                  {!userProfile?.is_verified && (
                    <Link
                      to="/verification/apply"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-all duration-200 delay-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <CheckCircle className="h-4 w-4 mr-3" />
                      Get Verified
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/articles"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-all duration-200 delay-250"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Manage Articles
                      </Link>
                      <Link
                        to="/admin/verifications"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-all duration-200 delay-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShieldCheck className="h-4 w-4 mr-3" />
                        Manage Verifications
                      </Link>
                    </>
                  )}
                </div>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none transition-all duration-200 delay-350 logout-btn-trigger"
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/ircnfpus.json"
                    trigger="hover"
                    target=".logout-btn-trigger"
                    style={{ width: '24px', height: '24px', marginRight: '12px', verticalAlign: 'middle', display: 'inline-block' }}
                  />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Auth Buttons - Only show when scrolled and not authenticated */}
      {scrolled && !isAuthenticated && (
        <div className={`fixed top-3 right-4 z-50 transition-all duration-500 ease-out ${
          scrolled ? 'opacity-100 scale-100 delay-200' : 'opacity-0 scale-95 delay-0'
        } transform`}>
          <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-lg rounded-full shadow-xl border border-neutral-200 px-4 py-4 h-16 min-h-16">
            <Link
              to="/login"
              className="text-neutral-700 hover:text-dental-600 font-medium text-sm px-5 py-2 rounded-full hover:bg-dental-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-dental-600 text-white px-5 py-2 rounded-full hover:bg-dental-700 font-medium transition-colors text-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

      {/* Close user menu when clicking outside */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white mt-16">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo and About */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-dental-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DR</span>
                </div>
                <span className="ml-2 font-semibold text-lg text-white">DentalReach</span>
              </div>
              <p className="text-neutral-300 text-sm mb-4">
                The digital platform connecting dental professionals worldwide through knowledge sharing, networking, and professional growth.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-medium text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/articles" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Articles
                  </Link>
                </li>
                <li>
                  <Link to="/forum" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to="/jobs" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Job Board
                  </Link>
                </li>
                <li>
                  <Link to="/dentists" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Find Dentists
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community & Support */}
            <div>
              <h4 className="font-medium text-white mb-4">Community</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/submit" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Submit Article
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-300 hover:text-dental-300 transition-colors text-sm">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-neutral-400 text-sm mb-4 md:mb-0">
                © 2025 DentalReach. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/privacy" className="text-neutral-400 hover:text-dental-400 text-sm transition-colors">
                  Privacy Policy
                </Link>
                <a href="#" className="text-neutral-400 hover:text-dental-400 text-sm transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;