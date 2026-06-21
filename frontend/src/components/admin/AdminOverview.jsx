import { Users, FileText, Video, CheckCircle, Zap, Target, Activity, Database, Cpu, Mail, Briefcase, Award, Trophy, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useState } from 'react';

const AdminOverview = ({ stats }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  if (!stats) return <div className="text-slate-400 p-8">Loading Mission Control data...</div>;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    }),
    hover: { 
      y: -5,
      boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.3)",
      borderColor: "rgba(99, 102, 241, 0.4)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Background ambient lighting specific to the overview */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Platform Overview</h2>
          <p className="text-slate-400 mt-1">Real-time metrics and API tracking</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Systems Nominal</span>
        </div>
      </div>
      
      {/* Unified Stats Grid (Column Wise) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div custom={0} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-indigo-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Users className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Total Users</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.totalUsers}</p>
        </motion.div>
        
        <motion.div custom={1} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Video size={64} className="text-fuchsia-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-fuchsia-500/20 rounded-xl">
              <Video className="text-fuchsia-400" size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Total Interviews</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.totalInterviews}</p>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={64} className="text-emerald-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Target className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Avg Score</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.avgScore}%</p>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} className="text-cyan-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Activity className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Active Today</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.activeUsersToday}</p>
        </motion.div>

        <motion.div custom={4} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText size={64} className="text-blue-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FileText className="text-blue-400" size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">Resume Uploads</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.totalResumes}</p>
        </motion.div>

        <motion.div custom={5} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={64} className="text-orange-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Zap className="text-orange-400" size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">New Users (Week)</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.newUsersThisWeek}</p>
        </motion.div>

        <motion.div custom={6} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-gradient-to-br from-indigo-900/50 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Briefcase size={64} className="text-indigo-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-indigo-500/20 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Briefcase className="text-indigo-300" size={24} />
            </div>
            <h3 className="text-indigo-200 font-medium">Total Jobs Clicked</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.jobsApplied}</p>
        </motion.div>

        <motion.div custom={7} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award size={64} className="text-yellow-400" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Award className="text-yellow-400" size={24} />
            </div>
            <h3 className="text-slate-400 font-medium">AI Evaluations</h3>
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.completedInterviews || 0}</p>
        </motion.div>
      </div>

      {/* Leaderboards - Top Candidates */}
      {stats.topCandidates && stats.topCandidates.length > 0 && (
        <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Trophy className="text-yellow-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Leaderboards (Top Candidates)</h3>
          </div>
          <div className="flex flex-col gap-3">
            {stats.topCandidates.map((candidate, idx) => (
              <div key={idx} onClick={() => setSelectedCandidate(candidate)} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2 group hover:bg-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 shadow-yellow-500/50' : 
                    idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 shadow-slate-400/50' : 
                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-700/50' : 
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {idx + 1}
                  </div>
                  
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-slate-950/50 flex items-center justify-center text-indigo-400 font-bold border border-slate-700 text-sm sm:text-base">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-white font-bold text-sm sm:text-lg tracking-wide truncate">{candidate.name}</h4>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="hidden sm:block h-2 w-32 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-600' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${candidate.score}%` }}
                    />
                  </div>
                  <div className="px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-700 min-w-[50px] sm:min-w-[70px] text-center shadow-inner">
                    <span className={`font-bold text-sm sm:text-lg ${
                        idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-500' : 'text-indigo-400'
                      }`}>{candidate.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* API Tracking Full Width */}
      {stats.apiLimits && (
        <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Database className="text-blue-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Live API Usage & Limits</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gemini */}
            <div className="flex flex-col items-center p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <div className="w-24 h-24 mb-4">
                <CircularProgressbar 
                  value={(stats.apiLimits.gemini.used / stats.apiLimits.gemini.limit) * 100} 
                  text={`${Math.max(0, stats.apiLimits.gemini.limit - stats.apiLimits.gemini.used)} left`}
                  styles={buildStyles({
                    pathColor: '#8b5cf6', // purple
                    textColor: '#fff',
                    trailColor: '#1e293b',
                    textSize: '16px',
                    pathTransitionDuration: 1.5
                  })}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-medium flex items-center justify-center gap-1.5 text-lg"><Cpu size={16} className="text-purple-400"/> Gemini API</p>
                <p className="text-sm text-slate-400 mt-1">Daily Limit: {stats.apiLimits.gemini.limit}</p>
              </div>
            </div>

            {/* Groq */}
            <div className="flex flex-col items-center p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <div className="w-24 h-24 mb-4">
                <CircularProgressbar 
                  value={(stats.apiLimits.groq.used / stats.apiLimits.groq.limit) * 100} 
                  text={`${Math.max(0, stats.apiLimits.groq.limit - stats.apiLimits.groq.used)} left`}
                  styles={buildStyles({
                    pathColor: '#ec4899', // pink
                    textColor: '#fff',
                    trailColor: '#1e293b',
                    textSize: '16px',
                    pathTransitionDuration: 1.5
                  })}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-medium flex items-center justify-center gap-1.5 text-lg"><Zap size={16} className="text-pink-400"/> Groq Llama 3</p>
                <p className="text-sm text-slate-400 mt-1">Daily Limit: {stats.apiLimits.groq.limit}</p>
              </div>
            </div>

            {/* JSearch */}
            <div className="flex flex-col items-center p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <div className="w-24 h-24 mb-4">
                <CircularProgressbar 
                  value={(stats.apiLimits.jsearch.used / stats.apiLimits.jsearch.limit) * 100} 
                  text={`${Math.max(0, stats.apiLimits.jsearch.limit - stats.apiLimits.jsearch.used)} left`}
                  styles={buildStyles({
                    pathColor: '#3b82f6', // blue
                    textColor: '#fff',
                    trailColor: '#1e293b',
                    textSize: '16px',
                    pathTransitionDuration: 1.5
                  })}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-medium flex items-center justify-center gap-1.5 text-lg"><Briefcase size={16} className="text-blue-400"/> JSearch API</p>
                <p className="text-sm text-slate-400 mt-1">Monthly Limit: {stats.apiLimits.jsearch.limit}</p>
              </div>
            </div>

            {/* Resend */}
            <div className="flex flex-col items-center p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <div className="w-24 h-24 mb-4">
                <CircularProgressbar 
                  value={(stats.apiLimits.resend.used / stats.apiLimits.resend.limit) * 100} 
                  text={`${Math.max(0, stats.apiLimits.resend.limit - stats.apiLimits.resend.used)} left`}
                  styles={buildStyles({
                    pathColor: '#10b981', // emerald
                    textColor: '#fff',
                    trailColor: '#1e293b',
                    textSize: '16px',
                    pathTransitionDuration: 1.5
                  })}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-medium flex items-center justify-center gap-1.5 text-lg"><Mail size={16} className="text-emerald-400"/> Resend Mail</p>
                <p className="text-sm text-slate-400 mt-1">Monthly Limit: {stats.apiLimits.resend.limit}</p>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {!stats.apiLimits && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <p className="text-rose-400 font-medium">Please refresh the page to load real-time API Limits data.</p>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pt-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-indigo-500 to-emerald-500 z-10"></div>
            
            <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Candidate Evaluation</h2>
                <p className="text-slate-400 text-xs">Admin Quick View</p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar space-y-5 bg-slate-950">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/30">
                    {selectedCandidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white mb-0.5">{selectedCandidate.name}</h1>
                    <p className="text-indigo-400 text-sm font-medium">{selectedCandidate.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-slate-300">{selectedCandidate.score}%</h2>
                  <p className="text-slate-500 text-xs">{selectedCandidate.interviewType} Mode</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                {/* Overall Performance Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-lg sm:w-1/3">
                  <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Overall Score</h3>
                  <div className="w-24 h-24 mb-4 font-bold">
                    <CircularProgressbar 
                      value={selectedCandidate.score / 10} 
                      maxValue={10} 
                      text={`${(selectedCandidate.score / 10).toFixed(1)}`} 
                      styles={buildStyles({
                        textSize: '28px',
                        pathColor: selectedCandidate.score >= 80 ? '#10b981' : selectedCandidate.score >= 60 ? '#f59e0b' : '#ef4444',
                        textColor: '#f8fafc',
                        trailColor: '#1e293b',
                      })}
                    />
                  </div>
                  <h4 className="text-slate-200 text-sm font-bold">{selectedCandidate.score >= 80 ? 'Excellent' : selectedCandidate.score >= 60 ? 'Good' : 'Needs Work'}</h4>
                </div>

                {/* Feedback Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:w-2/3">
                  <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Final AI Feedback</h3>
                  {selectedCandidate.feedback ? (
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex-1 overflow-y-auto custom-scrollbar">
                      <p className="text-slate-300 text-sm leading-relaxed italic">
                        "{selectedCandidate.feedback}"
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 italic text-sm">
                      No feedback generated for this session.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
