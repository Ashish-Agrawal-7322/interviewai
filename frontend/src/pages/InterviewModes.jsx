import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Users, ShieldCheck, FileText, ArrowLeft, Code2, Building2 } from 'lucide-react';
import { useEffect } from 'react';

const InterviewModes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (!user) navigate('/login');
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link to="/dashboard" className="text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-2 transition-colors mb-6 w-fit">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Interview Modes</h1>
        <p className="text-lg text-slate-400 max-w-2xl">Select a specialized track to begin your mock interview. Our AI will automatically configure the session parameters to match your chosen mode.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          
          {/* Coding Interview Mode (Spans Full Width) */}
          <Link to="/interview/setup" state={{ mode: 'coding' }} className="md:col-span-2 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-cyan-500/50 rounded-3xl p-8 flex items-center justify-between group shadow-xl hover:shadow-cyan-500/10 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/30"></div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Coding Interview Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Dedicated split-screen IDE for Data Structures, Algorithms, and LeetCode-style questions.
              </p>
            </div>
            <div className="w-16 h-16 shrink-0 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Code2 size={32} />
            </div>
          </Link>
          
          <Link to="/interview/setup" state={{ mode: 'standard' }} className="bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-indigo-500/50 rounded-3xl p-8 flex items-center justify-between group shadow-xl hover:shadow-indigo-500/10 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30"></div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Standard Interview Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Conversational, interactive interviews targeting Technical, HR, or both domains.</p>
            </div>
            <div className="w-16 h-16 shrink-0 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
          </Link>

          <Link to="/interview/setup" state={{ mode: 'gov' }} className="bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-emerald-500/50 rounded-3xl p-8 flex items-center justify-between group shadow-xl hover:shadow-emerald-500/10 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30"></div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Gov Exam Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Strict panel-style interviews mimicking real UPSC or SSC exams.</p>
            </div>
            <div className="w-16 h-16 shrink-0 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck size={32} />
            </div>
          </Link>

          <Link to="/interview/setup" state={{ mode: 'company' }} className="bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-amber-500/50 rounded-3xl p-8 flex items-center justify-between group shadow-xl hover:shadow-amber-500/10 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/30"></div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Company-Based Interview Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Tailor your mock interview to the specific format, questions, and core values of top tech companies.
              </p>
            </div>
            <div className="w-16 h-16 shrink-0 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Building2 size={32} />
            </div>
          </Link>

          <Link to="/interview/setup" state={{ mode: 'resume' }} className="bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-amber-500/50 rounded-3xl p-8 flex items-center justify-between group shadow-xl hover:shadow-amber-500/10 cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/30"></div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Resume-Based Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Upload your CV to generate highly personalized questions.</p>
            </div>
            <div className="w-16 h-16 shrink-0 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
          </Link>

        </div>
      </motion.div>

    </div>
  );
};

export default InterviewModes;
