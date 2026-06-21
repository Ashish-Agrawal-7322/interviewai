import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isHome = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#0a0f1c]/90 backdrop-blur-xl border-white/10 shadow-lg' : isHome ? 'bg-transparent border-transparent' : 'bg-[#0a0f1c]/80 backdrop-blur-xl border-white/5'}`}>
      <div className={`${isAdminPage ? 'w-full' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="relative w-10 h-10 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 transition-all group-hover:shadow-violet-500/40 group-hover:scale-105">
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-white tracking-tight">
                InterviewAI
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {userInfo ? (
              <>
                {!userInfo.isAdmin && (
                  <>
                    <Link to="/jobs" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1">
                      <Sparkles size={16} /> Explore Jobs
                    </Link>
                    <Link to="/dashboard" className="text-slate-300 hover:text-white font-medium transition-colors">
                      Dashboard
                    </Link>
                  </>
                )}
                {userInfo.isAdmin && (
                  <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Admin Panel
                  </Link>
                )}
                <div className="h-6 w-px bg-slate-800"></div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">Hi, <span className="text-slate-200">{userInfo.name}</span></span>
                  <button
                    onClick={logoutHandler}
                    className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login?redirect=/jobs" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all font-medium border border-indigo-500/10">
                  <Sparkles size={16} />
                  <span>Explore Jobs</span>
                </Link>
                
                <div className="h-5 w-px bg-slate-800"></div>

                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                  Log in
                </Link>

                <div className="flex items-center gap-3">
                  <Link to="/signup">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30 transition-all"
                    >
                      Sign up
                    </motion.button>
                  </Link>
                  <Link to="/admin-login">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 text-orange-400 hover:text-orange-300 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-orange-500/20 transition-all"
                    >
                      Admin Login
                    </motion.button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col space-y-4">
              {userInfo ? (
                <>
                  {!userInfo.isAdmin && (
                    <>
                      <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="text-indigo-400 font-medium flex items-center gap-2">
                        <Sparkles size={16} /> Explore Jobs
                      </Link>
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 font-medium">
                        Dashboard
                      </Link>
                    </>
                  )}
                  {userInfo.isAdmin && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-indigo-400 font-medium">
                      Admin Panel
                    </Link>
                  )}
                  <div className="h-px w-full bg-slate-800 my-2"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Hi, <span className="text-slate-200">{userInfo.name}</span></span>
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); logoutHandler(); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login?redirect=/jobs" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/10">
                    <Sparkles size={16} /> Explore Jobs
                  </Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-slate-300 font-medium py-2">
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-indigo-600 text-white py-3 rounded-xl font-bold">
                    Sign up
                  </Link>
                  <Link to="/admin-login" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-slate-800 text-orange-400 py-3 rounded-xl font-bold">
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
