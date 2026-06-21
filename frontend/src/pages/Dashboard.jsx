import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, BrainCircuit, Users, Target, ShieldCheck, Zap, Briefcase, FileText, Play, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (!user) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(user);
      setUserInfo(parsedUser);
      fetchDashboardData(parsedUser.token);
    }
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const interviewRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews`, config);
      setInterviews(interviewRes.data);

      const leaderboardRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/leaderboard`, config);
      setLeaderboard(leaderboardRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  };

  // Process data for charts
  const completedInterviews = interviews.filter(i => i.status === 'Completed').reverse();
  
  // KPI Stats
  const totalInterviews = completedInterviews.length;
  const avgScore = totalInterviews > 0 ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.overallScore, 0) / totalInterviews) : 0;
  const highestScore = totalInterviews > 0 ? Math.max(...completedInterviews.map(i => i.overallScore)) : 0;
  
  // Area Chart: Performance over time (Score by Date)
  const timeData = completedInterviews.map((i) => ({
    date: new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: i.overallScore || 0,
    role: i.role
  }));

  // Bar Chart: Average Score by Type
  const scoreByType = completedInterviews.reduce((acc, curr) => {
    if (!acc[curr.interviewType]) {
      acc[curr.interviewType] = { total: 0, count: 0 };
    }
    acc[curr.interviewType].total += curr.overallScore;
    acc[curr.interviewType].count += 1;
    return acc;
  }, {});

  const barData = Object.keys(scoreByType).map(type => ({
    type: type,
    avgScore: Math.round(scoreByType[type].total / scoreByType[type].count)
  }));

  // Aggregate Skills
  const skillMap = {};
  completedInterviews.forEach(interview => {
    if (interview.skills && Array.isArray(interview.skills)) {
      interview.skills.forEach(skill => {
        if (!skillMap[skill.name]) {
          skillMap[skill.name] = { total: 0, count: 0 };
        }
        skillMap[skill.name].total += skill.score;
        skillMap[skill.name].count += 1;
      });
    }
  });

  const aggregatedSkills = Object.keys(skillMap).map(name => ({
    name,
    score: Math.round(skillMap[name].total / skillMap[name].count)
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Welcome back, {userInfo?.name?.split(' ')[0]}</h1>
          <p className="text-lg text-slate-400">Track your progress and choose your next challenge.</p>
        </div>
        <Link to="/interview-modes" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 flex items-center gap-2 transform hover:-translate-y-0.5">
          <Play size={18} fill="currentColor" />
          Start Interview
        </Link>
      </motion.div>
      
      {userInfo && (
        <div className="space-y-8">
          
          {/* Top KPI Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <Target size={18} className="text-indigo-400" /> <span className="text-sm font-medium uppercase tracking-wider">Total Taken</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalInterviews}</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <Activity size={18} className="text-emerald-400" /> <span className="text-sm font-medium uppercase tracking-wider">Avg Score</span>
              </div>
              <div className="text-3xl font-bold text-white">{avgScore}%</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <Zap size={18} className="text-amber-400" /> <span className="text-sm font-medium uppercase tracking-wider">Highest Score</span>
              </div>
              <div className="text-3xl font-bold text-white">{highestScore}%</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 text-slate-400 mb-2">
                <BrainCircuit size={18} className="text-purple-400" /> <span className="text-sm font-medium uppercase tracking-wider">Best Mode</span>
              </div>
              <div className="text-xl font-bold text-white truncate">
                {barData.length > 0 ? barData.reduce((prev, current) => (prev.avgScore > current.avgScore) ? prev : current).type : 'N/A'}
              </div>
            </motion.div>
          </div>

          {/* Global Leaderboard */}
          {leaderboard && leaderboard.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="text-yellow-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Global Leaderboard (Top Candidates)</h3>
              </div>
              <div className="flex flex-col gap-3">
                {leaderboard.map((candidate, idx) => (
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Area Chart: Progression */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-xl rounded-2xl col-span-1 lg:col-span-3 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <Activity className="text-indigo-400" /> Score Progression
              </h3>
              <div className="h-[280px] w-full">
                {timeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 8, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">Complete interviews to see progression.</div>
                )}
              </div>
            </motion.div>

            {/* Bar Chart: Scores by Type */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-xl rounded-2xl col-span-1 lg:col-span-2 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <BrainCircuit className="text-purple-400" /> Avg Score by Mode
              </h3>
              <div className="h-[280px] w-full">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="type" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: '#1e293b' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      />
                      <Bar dataKey="avgScore" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">No data available yet.</div>
                )}
              </div>
            </motion.div>

          </div>



        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <button 
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-3xl border border-slate-600 mb-4 shadow-inner">
                {selectedCandidate.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">{selectedCandidate.name}</h2>
              <p className="text-indigo-400 font-medium">{selectedCandidate.role}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Overall Score</p>
                  <p className="text-3xl font-bold text-emerald-400">{selectedCandidate.score}%</p>
                </div>
                
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Interview Mode</p>
                  <p className="text-xl text-fuchsia-400 font-medium truncate">{selectedCandidate.interviewType || 'Standard'}</p>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-400 font-medium">Experience Level</p>
                <p className="text-sm text-white font-bold bg-slate-900 px-3 py-1.5 rounded-md border border-slate-700">{selectedCandidate.experience}</p>
              </div>

              {selectedCandidate.feedback && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Final Feedback</p>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    <p className="text-slate-300 text-sm leading-relaxed italic">
                      "{selectedCandidate.feedback}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
