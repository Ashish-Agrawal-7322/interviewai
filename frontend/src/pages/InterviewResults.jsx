import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, Clock, AlertCircle, PlayCircle, BarChart2, Star, MessageSquare, Bot, ArrowRight, Activity, Smile, Eye, Target, Download, ArrowLeft, Award, BookOpen, Camera, ShieldAlert } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

const InterviewResults = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  const reportRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/${id}`, config);
        setInterview(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        toast.error("Failed to load interview results");
      }
    };
    fetchResults();
  }, [id]);

  const downloadPDF = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Interview_Report_${interview?.role?.replace(/\s+/g, '_')}`
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-indigo-400 animate-pulse">Generating Final AI Report...</p>
    </div>
  );
  
  if (!interview) return <div className="text-center mt-20 text-red-500 min-h-screen bg-slate-950">Error loading results.</div>;

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

        {/* The entire report ref for PDF generation */}
        <div ref={reportRef} className="space-y-8 pb-10 bg-slate-950">

          {/* Print Only Header (Hidden on screen) */}
          <div className="hidden print-header mb-8">
            <div className="flex justify-between items-end border-b border-slate-300 pb-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">InterviewAI</h1>
                <p className="text-slate-500 text-sm font-medium">Advanced Candidate Assessment Report</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-slate-800">{interview.role}</h2>
                <p className="text-slate-500 text-sm">{new Date(interview.createdAt).toLocaleDateString()} • {interview.interviewType}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Interview Results</h1>
            <p className="text-xl text-indigo-400 font-medium">{interview.role} <span className="text-slate-500 text-base">({interview.experience})</span></p>
          </div>

          {/* Score & Assessment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <Award className="text-indigo-400 w-12 h-12 mb-4" />
              <h3 className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-sm">Overall Score</h3>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {interview.overallScore}%
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-8 md:col-span-2 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <Bot className="text-emerald-400" /> Final AI Assessment
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">{interview.overallFeedback}</p>
            </motion.div>
          </div>

          {/* Roadmap */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden"
          >
            <div className="bg-slate-950/50 px-8 py-5 border-b border-slate-800 flex items-center gap-3">
              <BookOpen className="text-blue-400" />
              <h2 className="text-xl font-bold text-white">Recommended Study Roadmap</h2>
            </div>
            <div className="p-8 prose prose-invert max-w-none text-slate-300 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: interview.roadmap.replace(/\n/g, '<br/>') }} />
            </div>
          </motion.div>

          {/* Behavioral Analysis (Video Metrics) */}
          {interview.interviewType !== 'Coding' && interview.videoMetrics && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden mt-6"
            >
              <div className="bg-slate-950/50 px-8 py-5 border-b border-slate-800 flex items-center gap-3">
                <Camera className="text-pink-400" />
                <h2 className="text-xl font-bold text-white">Behavioral Analysis (AI Vision)</h2>
              </div>

              {interview.videoMetrics.hasVideoData === false ? (
                <div className="p-8 text-center text-slate-500">
                  <p>Insufficient camera data was captured during this session to generate a behavioral analysis.</p>
                </div>
              ) : (
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Eye Contact Score */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="text-slate-800 stroke-current" strokeWidth="12" fill="none" />
                        <circle cx="64" cy="64" r="56" className="text-pink-500 stroke-current" strokeWidth="12" fill="none" strokeDasharray={`${interview.videoMetrics.eyeContactScore * 3.51} 351`} strokeLinecap="round" />
                      </svg>
                      <span className="text-3xl font-black text-white">{interview.videoMetrics.eyeContactScore}%</span>
                    </div>
                    <h3 className="font-bold text-slate-300">Eye Contact</h3>
                    <p className="text-sm text-slate-500 mt-1">Consistency in facing the interviewer.</p>
                  </div>

                  {/* Stress Management */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="text-slate-800 stroke-current" strokeWidth="12" fill="none" />
                        <circle cx="64" cy="64" r="56" className="text-emerald-500 stroke-current" strokeWidth="12" fill="none" strokeDasharray={`${(100 - interview.videoMetrics.stressLevel) * 3.51} 351`} strokeLinecap="round" />
                      </svg>
                      <span className="text-3xl font-black text-white">{100 - interview.videoMetrics.stressLevel}%</span>
                    </div>
                    <h3 className="font-bold text-slate-300">Stress Management</h3>
                    <p className="text-sm text-slate-500 mt-1">Based on facial expression stability.</p>
                  </div>

                  {/* Dominant Expression */}
                  <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center text-4xl mb-4 border border-slate-700">
                      {interview.videoMetrics.dominantExpression === 'happy' ? '😊' : 
                       interview.videoMetrics.dominantExpression === 'sad' ? '😔' :
                       interview.videoMetrics.dominantExpression === 'fearful' ? '😨' :
                       interview.videoMetrics.dominantExpression === 'angry' ? '😠' :
                       interview.videoMetrics.dominantExpression === 'surprised' ? '😲' :
                       interview.videoMetrics.dominantExpression === 'disgusted' ? '🤢' : '😐'}
                    </div>
                    <h3 className="font-bold text-slate-300 capitalize text-xl text-indigo-400">{interview.videoMetrics.dominantExpression}</h3>
                    <p className="text-sm text-slate-500 mt-2">Dominant micro-expression detected during the interview.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Proctoring Report */}
          {interview.proctoringWarnings && Object.values(interview.proctoringWarnings).some(v => v > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden mt-6"
            >
              <div className="bg-slate-950/50 px-8 py-5 border-b border-slate-800 flex items-center gap-3">
                <ShieldAlert className="text-red-400" />
                <h2 className="text-xl font-bold text-white">Proctoring Report</h2>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className={`p-6 rounded-xl border flex flex-col items-center justify-center ${interview.proctoringWarnings.tabSwitch > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                  <span className={`text-4xl font-black mb-3 ${interview.proctoringWarnings.tabSwitch > 0 ? 'text-red-400' : 'text-slate-400'}`}>{interview.proctoringWarnings.tabSwitch}</span>
                  <span className="text-sm font-medium text-slate-300">Tab Switches</span>
                </div>
                <div className={`p-6 rounded-xl border flex flex-col items-center justify-center ${interview.proctoringWarnings.faceMissing > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                  <span className={`text-4xl font-black mb-3 ${interview.proctoringWarnings.faceMissing > 0 ? 'text-red-400' : 'text-slate-400'}`}>{interview.proctoringWarnings.faceMissing}</span>
                  <span className="text-sm font-medium text-slate-300">Face Missing</span>
                </div>
                <div className={`p-6 rounded-xl border flex flex-col items-center justify-center ${interview.proctoringWarnings.micOff > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                  <span className={`text-4xl font-black mb-3 ${interview.proctoringWarnings.micOff > 0 ? 'text-red-400' : 'text-slate-400'}`}>{interview.proctoringWarnings.micOff}</span>
                  <span className="text-sm font-medium text-slate-300">Mic Off</span>
                </div>
                <div className={`p-6 rounded-xl border flex flex-col items-center justify-center ${interview.proctoringWarnings.copyPaste > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                  <span className={`text-4xl font-black mb-3 ${interview.proctoringWarnings.copyPaste > 0 ? 'text-red-400' : 'text-slate-400'}`}>{interview.proctoringWarnings.copyPaste}</span>
                  <span className="text-sm font-medium text-slate-300">Copy/Paste</span>
                </div>
              </div>
            </motion.div>
          )}

          {interview.skills && interview.skills.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-xl rounded-2xl p-6 mt-12"
            >
              <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <Target className="text-pink-400" /> AI Skill Evaluation Analytics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {interview.skills.map((skill, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center text-center">
                    <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" className="text-slate-800 stroke-current" strokeWidth="8" fill="none" />
                        <circle cx="48" cy="48" r="40" className="text-pink-500 stroke-current" strokeWidth="8" fill="none" strokeDasharray={`${skill.score * 2.51} 251`} strokeLinecap="round" />
                      </svg>
                      <span className="text-xl font-bold text-white">{skill.score}%</span>
                    </div>
                    <h3 className="font-medium text-sm text-slate-300 px-2 line-clamp-2">{skill.name}</h3>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <h2 className="text-2xl font-bold text-white mt-12 mb-6 flex items-center gap-3">
            <MessageSquare className="text-purple-400" /> Question Breakdown
          </h2>
          
          <div className="space-y-6">
            {interview.questions.map((q, index) => (
              <motion.div 
                key={q._id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg overflow-hidden"
              >
                <div className="bg-slate-950/50 px-6 py-5 flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-800">
                  <h3 className="text-lg font-medium text-slate-200 leading-relaxed">
                    <span className="text-indigo-400 font-bold mr-2">Q{index + 1}:</span> {q.questionText}
                  </h3>
                  <div className="inline-flex items-center rounded-lg bg-indigo-500/10 px-3 py-1 text-sm font-bold text-indigo-400 border border-indigo-500/20 shrink-0 shadow-inner">
                    Score: {q.aiScore}/10
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  <div className="p-6 bg-slate-900/30">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Answer</h4>
                    <p className="text-slate-300 italic leading-relaxed text-sm">{q.userAnswer}</p>
                  </div>
                  
                  <div className="p-6 bg-indigo-900/10 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30"></div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Bot size={14} /> {interview.interviewType === 'Gov Exam' ? 'UPSC Panel Feedback' : 'AI Feedback'}
                    </h4>
                    <div className="text-slate-300 leading-relaxed text-sm prose prose-invert max-w-none prose-sm"
                         dangerouslySetInnerHTML={{ __html: q.aiFeedback.replace(/\n/g, '<br/>') }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InterviewResults;