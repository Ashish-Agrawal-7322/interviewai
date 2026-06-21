import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Play, Send, Clock, AlertCircle, CheckCircle2, ChevronRight, Terminal, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

const TIME_LIMIT = 1200; // 20 minutes global timer in seconds

const CodingSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Code Editor State
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [answer, setAnswer] = useState('// Write your solution here...\n');
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(true);
  
  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' or 'feedback'

  // Proctoring States
  const [warnings, setWarnings] = useState({ copyPaste: 0 });
  const warningsRef = useRef(warnings);
  useEffect(() => { warningsRef.current = warnings; }, [warnings]);

  useEffect(() => {
    fetchInterview();

    const handleCopyPaste = (e) => {
      setWarnings(prev => ({ ...prev, copyPaste: prev.copyPaste + 1 }));
      toast.warning('Proctoring Warning: Your Copy/Paste action has been logged.');
    };
    
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [id]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const fetchInterview = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/${id}`, config);
      setInterview(data);
      
      // Determine current question based on unanswered questions
      const nextUnanswered = data.questions.findIndex(q => !q.userAnswer);
      if (nextUnanswered !== -1) {
        setCurrentQuestionIndex(nextUnanswered);
        // Do not reset timeLeft here, it's a global timer
        setTimerActive(true);
        setActiveTab('problem');
        setAnswer('// Write your solution here...\n');
        setCodeOutput('');
      } else {
        // If all answered, complete
        completeInterview();
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load interview');
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    toast.error("Time's up! Submitting your code...");
    const currentCode = answer.trim();
    if (!currentCode || currentCode === '// Write your solution here...') {
      submitAnswer('SKIPPED_QUESTION', true);
    } else {
      submitAnswer(currentCode, true);
    }
  };

  const completeInterview = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/interviews/${id}/complete`, { proctoringWarnings: warningsRef.current }, config);
      navigate(`/interview/${id}/results`);
    } catch (err) {
      console.error(err);
    }
  };

  const runCode = async () => {
    setIsExecuting(true);
    setCodeOutput('Executing...');
    setActiveTab('problem'); // keep or change?
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const versionMap = { javascript: '18.15.0', python: '3.10.0', java: '15.0.2', cpp: '10.2.0', react: '18', html: '5', css: '3', angular: '18', typescript: '5.0', go: '1.20', php: '8.2', ruby: '3.2', rust: '1.68', csharp: '11' };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/code/execute`,
        { language: codeLanguage, version: versionMap[codeLanguage] || '*', sourceCode: answer },
        config
      );

      if (data.message && !data.run) {
        setCodeOutput('Execution Error: ' + data.message);
      } else {
        setCodeOutput(data.run?.output || data.compile?.output || 'Code executed successfully with no output.');
      }
    } catch (err) {
      setCodeOutput('Error executing code: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const submitAnswer = async (finalAnswer, isEndRequested = false) => {
    const codeToSubmit = typeof finalAnswer === 'string' ? finalAnswer : answer.trim();
    if (!codeToSubmit && codeToSubmit !== 'SKIPPED_QUESTION') return;

    setSubmitting(true);
    setTimerActive(false);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/${id}/answer`,
        { questionIndex: currentQuestionIndex, answer: codeToSubmit, endInterview: isEndRequested },
        config
      );
      
      setSubmitting(false);
      if (isEndRequested) {
        completeInterview();
      } else {
        setTimeout(() => fetchInterview(), 1500);
      }
    } catch (err) {
      setSubmitting(false);
      toast.error('Failed to evaluate answer. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!interview || !interview.questions[currentQuestionIndex]) return null;

  const currentQuestion = interview.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === interview.questions.length - 1;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-slate-300 flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-14 border-b border-white/10 bg-[#111111] flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-indigo-400 text-xl tracking-tight">InterviewAI</div>
          <div className="w-px h-6 bg-white/10 hidden md:block"></div>
          <div className="text-sm font-medium text-slate-400 hidden md:block">
            {interview.role} Coding Challenge
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold transition-colors ${timeLeft < 60 ? 'bg-red-500/10 text-red-500' : 'bg-slate-800/50 text-slate-300'}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm font-medium text-slate-400">
            Problem <span className="text-white">{currentQuestionIndex + 1}</span> of {interview.questions.length}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        
        {/* Left Panel: Problem Statement & Feedback */}
        <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-[#111111] min-h-[30vh]">
          <div className="flex border-b border-white/10">
            <button 
              onClick={() => setActiveTab('problem')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'problem' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'feedback' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              AI Feedback
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'problem' ? (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white leading-tight">
                  {currentQuestionIndex + 1}. Algorithm Challenge
                </h1>
                
                <div className="prose prose-invert max-w-none text-slate-300">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.questionText}
                  </p>
                </div>
                
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-amber-200/80">
                    Write your code in the right panel and test it using the "Run" button. When you are confident, click "Submit" to be evaluated by the AI.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentQuestionIndex > 0 && interview.questions[currentQuestionIndex - 1].aiScore !== undefined ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Previous Question Feedback</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-black text-emerald-400">
                        {interview.questions[currentQuestionIndex - 1].aiScore}/10
                      </div>
                      <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">
                        Score
                      </div>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-sm leading-relaxed text-slate-300">
                      {interview.questions[currentQuestionIndex - 1].aiFeedback}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-10">
                    <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Submit your first code to get AI feedback.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor & Terminal */}
        <div className="w-full md:w-2/3 flex flex-col bg-[#1e1e1e] flex-1">
          
          {/* Editor Header */}
          <div className="h-auto py-2 md:h-12 md:py-0 border-b border-white/5 bg-[#181818] flex flex-col md:flex-row items-start md:items-center justify-between px-4 shrink-0 gap-3 md:gap-0">
            <select 
              value={codeLanguage} 
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="bg-slate-800 border-none text-sm text-slate-200 rounded px-3 py-1.5 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="javascript">JavaScript (Node)</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="react">React</option>
              <option value="angular">Angular</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="rust">Rust</option>
              <option value="csharp">C#</option>
            </select>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto md:justify-end pb-2 md:pb-0">
              <button
                onClick={() => submitAnswer(answer.trim() || 'SKIPPED_QUESTION', true)}
                disabled={submitting || isExecuting}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold py-1.5 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                End Interview
              </button>
              <button
                onClick={runCode}
                disabled={isExecuting || submitting}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-1.5 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {isExecuting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Play size={14} fill="currentColor" />}
                Run
              </button>
              
              <button
                onClick={() => submitAnswer('SKIPPED_QUESTION')}
                disabled={submitting || isExecuting}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-sm font-semibold py-1.5 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                <SkipForward size={14} />
                Skip
              </button>
              <button
                onClick={() => submitAnswer()}
                disabled={submitting || isExecuting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-1.5 px-4 rounded-md transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit to AI'}
                {!submitting && <ChevronRight size={16} />}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[40vh]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={['python', 'java', 'cpp', 'html', 'css', 'typescript', 'php', 'ruby', 'rust', 'csharp', 'go'].includes(codeLanguage) ? codeLanguage : 'javascript'}
              value={answer}
              onChange={(val) => setAnswer(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                lineHeight: 24,
                padding: { top: 20 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </div>

          {/* Terminal Output */}
          <div className="h-[30vh] shrink-0 border-t border-white/5 bg-[#111111] flex flex-col pb-16 md:pb-0">
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#181818] text-sm font-medium text-slate-400">
              <Terminal size={16} />
              Console Output
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {codeOutput ? (
                <pre className="text-slate-300 whitespace-pre-wrap">{codeOutput}</pre>
              ) : (
                <div className="text-slate-600 italic">Run your code to see output here...</div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default CodingSession;
