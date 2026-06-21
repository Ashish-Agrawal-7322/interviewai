import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, Video, FileText, Settings, BarChart2, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminInterviews from '../components/admin/AdminInterviews';
import AdminResumes from '../components/admin/AdminResumes';
import AdminSettings from '../components/admin/AdminSettings';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/dashboard');
    } else {
      fetchOverviewData();
    }
  }, [navigate]);

  const fetchOverviewData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, config);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'interviews', label: 'Interviews', icon: Video },
    { id: 'resumes', label: 'Resumes', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'AI Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1523] flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Shield size={48} className="text-indigo-500" />
          <h2 className="text-xl font-semibold text-slate-300">Loading Mission Control...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1523] flex flex-col md:flex-row">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 bg-[#0a0f1c]/95 backdrop-blur-xl border-r border-white/5 flex-col pt-24 pb-6 relative z-10 hidden md:flex shadow-2xl flex-shrink-0">
        <div className="px-6 mb-10 flex items-center gap-4 group cursor-default">
          <div className="relative p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Shield className="text-white relative z-10" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wide">Admin Control</h1>
            <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mt-0.5">Mission Control</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium group overflow-hidden ${
                activeTab === item.id
                  ? 'text-white bg-gradient-to-r from-indigo-500/20 to-violet-500/5 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-r-full"
                />
              )}
              <item.icon 
                size={18} 
                className={`transition-all duration-300 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} 
              />
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="px-3 mt-auto">
          <button 
            onClick={logoutHandler}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 group"
          >
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pt-24 md:pt-24 pb-12 px-4 md:px-6 lg:px-12 relative w-full">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay z-0"></div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-4 custom-scrollbar-hide border-b border-white/5 relative z-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg whitespace-nowrap min-w-[80px] transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                  : 'text-slate-400 bg-slate-800/30 border border-transparent'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'} />
              <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          {activeTab === 'overview' && <AdminOverview stats={stats} />}
          {activeTab === 'users' && <AdminUsers token={userInfo.token} />}
          {activeTab === 'interviews' && <AdminInterviews token={userInfo.token} />}
          {activeTab === 'resumes' && <AdminResumes token={userInfo.token} />}
          {activeTab === 'analytics' && <AdminAnalytics token={userInfo.token} />}
          {activeTab === 'settings' && <AdminSettings token={userInfo.token} />}
        </div>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>
    </div>
  );
};

export default AdminDashboard;
