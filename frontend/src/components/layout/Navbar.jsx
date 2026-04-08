import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Menu, X, Stethoscope, Calendar, LogOut, User, Shield } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  // Check authentication status from JWT token and user data
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("currentUser");
    
    console.log("Auth check - token exists:", !!token);
    console.log("Auth check - userStr:", userStr);
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(userData.role);
        setUserName(userData.name || userData.email?.split('@')[0] || 'User');
        console.log("User logged in:", userData.name, "Role:", userData.role);
      } catch (e) {
        console.error("Error parsing user data:", e);
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName('');
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (logout from other tabs)
    window.addEventListener('storage', checkAuthStatus);
    
    // Custom event for auth changes
    window.addEventListener('authChange', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Clear all auth-related items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    setIsLoggedIn(false);
    setUserRole(null);
    setUserName('');

    // Dispatch custom event for auth change
    window.dispatchEvent(new Event('authChange'));

    // Navigate to home page
    navigate('/');
  };

  // Build nav links dynamically
  const getNavLinks = () => {
    const links = [
      { label: 'Home', to: '/' },
      { icon: <Stethoscope size={16} />, label: 'Doctors', to: '/doctors' },
    ];

    // Add appointments link for logged in users
    if (isLoggedIn) {
      links.push({
        label: 'Appointments', 
        to: '/appointments', 
        icon: <Calendar size={16} />,
      });
    }

    // Add admin panel link for admin users
    if (isLoggedIn && userRole === 'admin') {
      links.push({
        label: 'Admin Panel',
        to: '/addDoctors',
        icon: <Shield size={16} />,
      });
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-md py-3 bg-white' : 'bg-white/30 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="rounded-xl gradient-card flex items-center justify-center shadow-lg shadow-sky-200">
            <img src="/images/logo.png" alt="Logo" className='w-10 h-10 object-cover' />
          </div>
          <span className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: '"Playfair Display", serif' }}>
            Medi<span className="text-gradient">Care</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-md font-medium text-[#64748B] hover:text-[#0EA5E9] transition-colors duration-200 flex items-center gap-1.5"
            >
              {link.icon && link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                  <User size={16} className="text-[#378ADD]" />
                </div>
                <span className="text-sm text-[#64748B]">
                  Hello, <span className="font-semibold text-[#0F172A]">{userName}</span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-[#F0F9FF] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white bg-white px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-[#1E293B] hover:text-[#0EA5E9] transition-colors flex items-center gap-2"
            >
              {link.icon && link.icon}
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                    <User size={16} className="text-[#378ADD]" />
                  </div>
                  <span className="text-sm text-[#64748B]">
                    Hello, <span className="font-semibold text-[#0F172A]">{userName}</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 justify-center"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/signin" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="sm" fullWidth>Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;