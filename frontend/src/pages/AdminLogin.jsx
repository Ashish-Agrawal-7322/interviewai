import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Posting to the standard unified login endpoint
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        { email, password },
        config
      );

      if (!data.isAdmin) {
        setError('Access denied. Administrator privileges required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/admin');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen pt-20 relative overflow-hidden bg-transparent flex-col justify-center pb-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="p-3 bg-orange-500/20 rounded-2xl border border-orange-500/30">
            <Shield className="text-orange-400" size={40} />
          </div>
        </div>
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white"
        >
          Admin Portal
        </motion.h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-[#0f1523] py-8 px-4 shadow-2xl border border-orange-500/20 sm:rounded-3xl sm:px-10">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl relative mb-6 text-sm flex items-center">
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
          <form className="space-y-6" onSubmit={submitHandler}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
                Admin Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm"
                  placeholder="enter admin email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between ml-1 mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-400">
                  Password
                </label>
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-500/20 text-base font-bold text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                {loading ? 'Authenticating...' : 'Secure Login'} <ArrowRight size={20} />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Not an admin?{' '}
              <Link to="/login" className="font-medium text-orange-400 hover:text-orange-300">
                Return to standard login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
