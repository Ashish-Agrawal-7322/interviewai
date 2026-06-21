import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, SlidersHorizontal, Layers, BarChart2, Settings, LogOut, BookOpen, Fingerprint, Briefcase, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'Interview Modes', path: '/interview-modes', icon: Layers },
    { name: 'Custom Setup', path: '/interview/setup', icon: SlidersHorizontal },
    { name: 'AI Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Evaluation', path: '/evaluation', icon: BarChart2 }
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3 text-white font-extrabold text-[22px] tracking-tight">
          <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
          </div>
          InterviewAI
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer (Logout) */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logoutHandler}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header & Hamburger */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-slate-950 border-b border-slate-800 z-50 flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-white font-extrabold text-[18px] tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
          </div>
          InterviewAI
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)} 
          className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 h-screen bg-slate-950 border-r border-slate-800 flex-col fixed left-0 top-0 z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="md:hidden fixed top-0 left-0 w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
