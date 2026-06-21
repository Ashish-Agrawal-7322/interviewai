import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Calendar, Award, BookOpen, MessageSquare, Bot, X, ArrowRight, Download, Camera, CheckCircle, AlertCircle, Target, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useReactToPrint } from 'react-to-print';

const Evaluation = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);


  const printRef = useRef();

  const downloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Evaluation_${selectedInterview?.role?.replace(/\s+/g, '_')}`
  });

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews`, config);
        
        // Filter only completed interviews
        const completed = data.filter(inv => inv.status === 'Completed');
        setInterviews(completed);
      } catch (error) {
        console.error("Failed to fetch evaluations:", error);
        toast.error("Failed to load interview history");
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getGaugeColor = (score) => {
    if (score >= 8) return '#34d399'; // emerald-400
    if (score >= 6) return '#fbbf24'; // amber-400
    return '#f87171'; // red-400
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">Interview Evaluations</h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Review your past performances, read detailed feedback on every question, and track your improvement over time.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : interviews.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-xl rounded-3xl p-16 flex flex-col items-center justify-center text-center"
        >
          <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
            <BarChart2 className="w-12 h-12 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-3">No Evaluations Yet</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            Complete a mock interview to generate detailed AI evaluations and study roadmaps.
          </p>
          <button 
            onClick={() => navigate('/interview-setup')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            Start an Interview <ArrowRight size={18} />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview, index) => (
            <motion.div
              key={interview._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedInterview(interview)}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all hover:-translate-y-1 shadow-lg group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 line-clamp-1">{interview.role}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mt-1.5">
                    <Calendar size={14} />
                    {formatDate(interview.createdAt)}
                  </div>
                </div>
                <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 shadow-inner ${getScoreBg(interview.overallScore)}`}>
                  <span className={`text-xl font-black ${getScoreColor(interview.overallScore)}`}>{interview.overallScore}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <p className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                  <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">{interview.interviewType}</span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 truncate">{interview.experience}</span>
                </p>
                <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed mb-3">
                  {interview.overallFeedback || "No feedback generated."}
                </p>
                {interview.skills && interview.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {interview.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs px-2 py-0.5 rounded-full truncate max-w-[120px]">
                        {skill.name} • {skill.score}%
                      </span>
                    ))}
                    {interview.skills.length > 3 && (
                      <span className="text-xs text-slate-500 self-center">+{interview.skills.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInterview && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInterview(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-4 md:inset-10 lg:inset-x-24 top-10 md:top-20 z-50 bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Interview Analytics Dashboard</h2>
                  <p className="text-slate-400 text-sm">AI-powered performance insights • {formatDate(selectedInterview.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={downloadPDF}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                  <button 
                    onClick={() => setSelectedInterview(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body Scroll Container */}
              <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8 custom-scrollbar">
                {/* Printable Area (Natural Height) */}
                <div ref={printRef} className="print-container bg-slate-950">
                
                {/* Print Only Header (Hidden on screen) */}
                <div className="hidden print-header mb-8">
                  <div className="flex justify-between items-end border-b border-slate-300 pb-4 mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-indigo-700 mb-1">InterviewAI</h1>
                      <p className="text-slate-500 text-sm font-medium">Advanced Candidate Assessment Report</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-slate-800">{selectedInterview.role}</h2>
                      <p className="text-slate-500 text-sm">{formatDate(selectedInterview.createdAt)} • {selectedInterview.interviewType}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  
                  {/* Overall Performance */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center col-span-1 shadow-lg printable-card">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">Overall Performance</h3>
                    <div className="w-40 h-40 mb-6 font-bold">
                      <CircularProgressbar 
                        value={selectedInterview.overallScore / 10} 
                        maxValue={10} 
                        text={`${(selectedInterview.overallScore / 10).toFixed(1)}`} 
                        styles={buildStyles({
                          textSize: '24px',
                          pathColor: getGaugeColor(selectedInterview.overallScore / 10),
                          textColor: '#f8fafc',
                          trailColor: '#1e293b',
                        })}
                      />
                    </div>
                    <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">Out of 10</p>
                    <h4 className="text-slate-200 font-bold mb-1">{selectedInterview.overallScore >= 80 ? 'Excellent Performance.' : selectedInterview.overallScore >= 60 ? 'Good Performance.' : 'Significant improvement required.'}</h4>
                    <p className="text-slate-400 text-sm line-clamp-2">{selectedInterview.overallFeedback.split('.')[0]}.</p>
                  </div>

                  {/* Performance Trend */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 col-span-1 lg:col-span-2 shadow-lg printable-card">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">Performance Trend</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedInterview.questions.map((q, i) => ({ name: `Q${i+1}`, score: q.aiScore }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="score" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Skill Evaluation (AI Analysis) */}
                {selectedInterview.skills && selectedInterview.skills.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-lg printable-card overflow-hidden">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Award size={16} className="text-pink-400" /> Skill Evaluation (AI Analysis)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                      {selectedInterview.skills.map((skill, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center text-center">
                          <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                              <circle cx="56" cy="56" r="48" className="text-slate-800 stroke-current" strokeWidth="10" fill="none" />
                              <circle cx="56" cy="56" r="48" className="text-indigo-500 stroke-current" strokeWidth="10" fill="none" strokeDasharray={`${skill.score * 3.01} 301`} strokeLinecap="round" />
                            </svg>
                            <span className="text-2xl font-black text-white">{skill.score}%</span>
                          </div>
                          <h3 className="font-bold text-slate-300">{skill.name}</h3>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Behavioral Analysis (Video Metrics) */}
                {selectedInterview.videoMetrics && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-lg printable-card overflow-hidden">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Camera size={16} className="text-pink-400" /> Behavioral Analysis (AI Vision)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Eye Contact Score */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" className="text-slate-800 stroke-current" strokeWidth="10" fill="none" />
                            <circle cx="56" cy="56" r="48" className="text-pink-500 stroke-current" strokeWidth="10" fill="none" strokeDasharray={`${selectedInterview.videoMetrics.eyeContactScore * 3.01} 301`} strokeLinecap="round" />
                          </svg>
                          <span className="text-2xl font-black text-white">{selectedInterview.videoMetrics.eyeContactScore}%</span>
                        </div>
                        <h3 className="font-bold text-slate-300">Eye Contact</h3>
                        <p className="text-xs text-slate-500 mt-1">Consistency in facing the interviewer.</p>
                      </div>

                      {/* Stress Management */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" className="text-slate-800 stroke-current" strokeWidth="10" fill="none" />
                            <circle cx="56" cy="56" r="48" className="text-emerald-500 stroke-current" strokeWidth="10" fill="none" strokeDasharray={`${(100 - selectedInterview.videoMetrics.stressLevel) * 3.01} 301`} strokeLinecap="round" />
                          </svg>
                          <span className="text-2xl font-black text-white">{100 - selectedInterview.videoMetrics.stressLevel}%</span>
                        </div>
                        <h3 className="font-bold text-slate-300">Stress Management</h3>
                        <p className="text-xs text-slate-500 mt-1">Based on facial expression stability.</p>
                      </div>

                      {/* Dominant Expression */}
                      <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-3xl mb-4 border border-slate-700">
                          {selectedInterview.videoMetrics.dominantExpression === 'happy' ? '😊' : 
                           selectedInterview.videoMetrics.dominantExpression === 'sad' ? '😔' :
                           selectedInterview.videoMetrics.dominantExpression === 'fearful' ? '😨' :
                           selectedInterview.videoMetrics.dominantExpression === 'angry' ? '😠' :
                           selectedInterview.videoMetrics.dominantExpression === 'surprised' ? '😲' :
                           selectedInterview.videoMetrics.dominantExpression === 'disgusted' ? '🤢' : '😐'}
                        </div>
                        <h3 className="font-bold capitalize text-lg text-indigo-400">{selectedInterview.videoMetrics.dominantExpression}</h3>
                        <p className="text-xs text-slate-500 mt-2">Dominant micro-expression detected.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Proctoring Report */}
                {selectedInterview.proctoringWarnings && Object.values(selectedInterview.proctoringWarnings).some(v => v > 0) && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-lg printable-card overflow-hidden">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-red-400" /> Proctoring Report
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${selectedInterview.proctoringWarnings.tabSwitch > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                        <span className={`text-3xl font-black mb-2 ${selectedInterview.proctoringWarnings.tabSwitch > 0 ? 'text-red-400' : 'text-slate-400'}`}>{selectedInterview.proctoringWarnings.tabSwitch}</span>
                        <span className="text-sm font-medium text-slate-300">Tab Switches</span>
                      </div>
                      <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${selectedInterview.proctoringWarnings.faceMissing > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                        <span className={`text-3xl font-black mb-2 ${selectedInterview.proctoringWarnings.faceMissing > 0 ? 'text-red-400' : 'text-slate-400'}`}>{selectedInterview.proctoringWarnings.faceMissing}</span>
                        <span className="text-sm font-medium text-slate-300">Face Missing</span>
                      </div>
                      <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${selectedInterview.proctoringWarnings.micOff > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                        <span className={`text-3xl font-black mb-2 ${selectedInterview.proctoringWarnings.micOff > 0 ? 'text-red-400' : 'text-slate-400'}`}>{selectedInterview.proctoringWarnings.micOff}</span>
                        <span className="text-sm font-medium text-slate-300">Mic Off</span>
                      </div>
                      <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${selectedInterview.proctoringWarnings.copyPaste > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                        <span className={`text-3xl font-black mb-2 ${selectedInterview.proctoringWarnings.copyPaste > 0 ? 'text-red-400' : 'text-slate-400'}`}>{selectedInterview.proctoringWarnings.copyPaste}</span>
                        <span className="text-sm font-medium text-slate-300">Copy/Paste</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall Feedback & Roadmap */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-lg printable-card">
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Bot size={16} className="text-indigo-400" /> Overall AI Assessment
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {selectedInterview.overallFeedback || "No overall feedback provided."}
                  </p>
                  
                  {selectedInterview.roadmap && (
                    <>
                      <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-400" /> Study Roadmap
                      </h3>
                      <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: selectedInterview.roadmap.replace(/\n/g, '<br/>') }} />
                      </div>
                    </>
                  )}
                </div>

                {/* Question Breakdown */}
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6 ml-2">Question Breakdown</h3>
                  <div className="space-y-4">
                    {selectedInterview.questions.map((q, idx) => (
                      <div key={idx} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 printable-card shadow-md break-inside-avoid">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div>
                            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Question {idx + 1}</span>
                            <h4 className="text-white font-medium mt-1 leading-relaxed">{q.questionText}</h4>
                          </div>
                          <div className={`shrink-0 px-3 py-1 font-bold rounded-full text-sm border ${
                            q.aiScore >= 8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            q.aiScore >= 5 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {q.aiScore} / 10
                          </div>
                        </div>
                        
                        <div className="bg-slate-950/50 rounded-xl p-4 mb-4 border border-slate-800/50">
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 block">Your Answer</span>
                          <p className="text-slate-300 text-sm leading-relaxed italic">"{q.userAnswer}"</p>
                        </div>
                        
                        <div className="bg-emerald-900/10 rounded-xl p-4 border border-emerald-500/20">
                          <span className="text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Bot size={14} /> AI Feedback
                          </span>
                          <p className="text-emerald-100/70 text-sm leading-relaxed">{q.aiFeedback}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }

        /* Print Styles */
        @media print {
          @page {
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: #ffffff !important;
          }
          .print-container {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 30px !important;
          }
          .printable-card {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
          /* Invert text colors for print readability */
          .text-white, .text-slate-100, .text-slate-200, .text-slate-300 {
            color: #0f172a !important;
          }
          .text-slate-400, .text-slate-500 {
            color: #475569 !important;
          }
          .bg-slate-900, .bg-slate-950, .bg-slate-800 {
            background: #f8fafc !important;
          }
          .border-slate-800 {
            border-color: #e2e8f0 !important;
          }
          
          /* Keep accent colors but make them printer friendly */
          .text-emerald-400, .text-emerald-500 {
            color: #059669 !important;
          }
          .bg-emerald-900\\/10 {
            background: #ecfdf5 !important;
          }
          .border-emerald-500\\/20 {
            border-color: #a7f3d0 !important;
          }
          .text-emerald-100\\/70 {
            color: #065f46 !important;
          }
          .recharts-wrapper {
             /* Make recharts visible in print */
          }
        }
      `}</style>
    </div>
  );
};

export default Evaluation;
