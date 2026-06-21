import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Code2, Terminal, Play, Send, Volume2, Camera, CameraOff, Timer, SkipForward, Shield } from 'lucide-react';
import { toast } from 'sonner';
import * as faceapi from '@vladmandic/face-api';

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins global timer

  // New Conversational AI States
  const [sessionStarted, setSessionStarted] = useState(false);
  const sessionStartedRef = useRef(false);
  const [aiState, setAiState] = useState('idle'); // 'idle', 'speaking', 'listening', 'evaluating'
  const isInitialMount = useRef(true);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Coding State
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Webcam State
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const streamRef = useRef(null);

  // Behavioral Analysis State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const modelsLoadedRef = useRef(false);
  const expressionCounts = useRef({
    neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0
  });
  const faceDetectionCounts = useRef({ total: 0, detected: 0 });
  const analysisIntervalRef = useRef(null);
  const missingFaceCounterRef = useRef(0);

  // Proctoring State
  const [warnings, setWarnings] = useState({
    tabSwitch: 0,
    faceMissing: 0,
    micOff: 0,
    copyPaste: 0
  });
  const warningsRef = useRef(warnings);
  useEffect(() => { warningsRef.current = warnings; }, [warnings]);

  useEffect(() => {
    fetchInterview();
    initSpeechRecognition();
    loadFaceApiModels().then(() => startWebcam());
    
    // Proctoring Listeners
    const handleVisibilityChange = () => {
      if (document.hidden && sessionStartedRef.current) {
        setWarnings(prev => ({ ...prev, tabSwitch: prev.tabSwitch + 1 }));
        toast.warning('Warning: Tab switching detected!');
      }
    };
    const handleCopyPaste = (e) => {
      if (sessionStartedRef.current) {
        setWarnings(prev => ({ ...prev, copyPaste: prev.copyPaste + 1 }));
        toast.warning('Warning: Your Copy/Paste action has been logged.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      stopWebcam();
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [id]);

  const loadFaceApiModels = async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsLoaded(true);
      modelsLoadedRef.current = true;
      console.log('Face API models loaded');
    } catch (err) {
      console.error('Failed to load face-api models', err);
    }
  };

  // Handle auto-playing question when index changes, BUT only if session is started
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (sessionStarted && interview && interview.questions[currentQuestionIndex] && !submitting) {
       handleAutomatedIntro(currentQuestionIndex, interview.totalQuestions || interview.questions.length, interview.questions[currentQuestionIndex].questionText);
    }
  }, [currentQuestionIndex, sessionStarted]);

  useEffect(() => {
    if (timeLeft > 0 && !loading && !submitting && sessionStarted && aiState !== 'speaking') {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !submitting && !loading && sessionStarted) {
      handleAutoEnd();
    }
  }, [timeLeft, loading, submitting, sessionStarted, aiState]);

  const handleAutoEnd = () => {
    toast.error('Time is up! The 20-minute interview has concluded.', { duration: 3000 });
    submitAnswer(answer.trim() || 'SKIPPED_QUESTION', true);
  };

  const handleManualSkip = () => {
    if (window.confirm('Are you sure you want to skip this question? You will receive a score of 0.')) {
      submitAnswer('SKIPPED_QUESTION');
    }
  };

  const isCodingQuestion = (text) => {
    if (interview?.interviewType === 'Coding') return true;
    if (interview?.interviewType === 'Gov Exam') return false;
    const lowerText = text.toLowerCase();
    return lowerText.includes('write') || lowerText.includes('code') || lowerText.includes('implement') || lowerText.includes('function') || lowerText.includes('class');
  };

  const handleAutomatedIntro = (index, total, text) => {
    let intro = '';
    if (index === 0) {
      intro = "Welcome to the interview. Let's start with your first question. ";
    } else if (index === total - 1) {
      intro = "This will be your final question for this session. ";
    } else {
      const transitions = ["Alright, moving on. ", "Got it. Next question. ", "Let's proceed to the next one. "];
      intro = transitions[index % transitions.length];
    }

    const needsCode = isCodingQuestion(text);
    let outro = '';
    if (needsCode) {
      outro = " I recommend typing or coding your answer for this one.";
    }

    const fullSpeech = intro + text + outro;
    readQuestionAloud(fullSpeech, needsCode);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Webcam access denied:", err);
      setIsCameraOn(false);
      toast.error("Webcam access denied. Proceeding without video.");
    }
  };

  const startFaceAnalysis = () => {
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    analysisIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && modelsLoadedRef.current && sessionStartedRef.current) {
        try {
          faceDetectionCounts.current.total += 1;
          const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          if (!detections || detections.length !== 1) {
            missingFaceCounterRef.current += 1;
            if (missingFaceCounterRef.current >= 3) {
              setWarnings(prev => ({ ...prev, faceMissing: prev.faceMissing + 1 }));
              missingFaceCounterRef.current = 0;
              toast.warning('Warning: Face not visible or multiple faces detected.');
            }
          } else {
            missingFaceCounterRef.current = 0;
          }

          if (detections && detections.length > 0) {
            faceDetectionCounts.current.detected += 1;
            // Use the first face for expression tracking
            const expressions = detections[0].expressions;
            let maxExp = 'neutral';
            let maxVal = 0;
            for (const [exp, val] of Object.entries(expressions)) {
              if (val > maxVal) {
                maxVal = val;
                maxExp = exp;
              }
            }
            expressionCounts.current[maxExp] = (expressionCounts.current[maxExp] || 0) + 1;
          }
        } catch (error) {
          console.error("FaceAPI detection error:", error);
        }
      }
    }, 1000);
  };

  useEffect(() => {
    if (isCameraOn && sessionStarted) {
      startFaceAnalysis();
      // Mic Monitoring Interval
      const micInterval = setInterval(() => {
        if (streamRef.current && sessionStartedRef.current) {
          const audioTrack = streamRef.current.getAudioTracks()[0];
          if (!audioTrack || !audioTrack.enabled || audioTrack.readyState === 'ended') {
            setWarnings(prev => ({ ...prev, micOff: prev.micOff + 1 }));
          }
        }
      }, 3000);
      return () => {
        clearInterval(micInterval);
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      };
    }
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, [isCameraOn, sessionStarted]);

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopWebcam();
      setIsCameraOn(false);
    } else {
      startWebcam();
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswer(currentTranscript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (aiState === 'listening') setAiState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (aiState === 'listening') setAiState('idle');
      };

      recognitionRef.current = recognition;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAiState('idle');
    } else {
      setAnswer(''); 
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setAiState('listening');
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  const readQuestionAloud = (text, isCodeRecommend = false) => {
    window.speechSynthesis.cancel();
    setAiState('speaking');
    
    // Stop listening if mic is on
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      if (isCodeRecommend) {
        setAiState('idle');
        if (!showCodeEditor) setShowCodeEditor(true);
      } else {
        // Auto-start listening
        setAiState('listening');
        setShowCodeEditor(false);
        setAnswer('');
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch(err) {
          console.error("Failed to auto-start mic:", err);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const fetchInterview = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/${id}`, config);
      setInterview(data);
      if (data.interviewType === 'Coding') {
        setShowCodeEditor(true);
      }
      
      const firstUnanswered = data.questions.findIndex(q => !q.userAnswer);
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered);
      } else {
        if (data.status === 'Completed' || (data.questions.length === data.totalQuestions && data.questions.every(q => q.userAnswer))) {
          completeInterview(config);
        } else {
          setAiState('idle');
        }
      }
      setLoading(false);
    } catch (error) {
      navigate('/dashboard');
    }
  };

  const completeInterview = async (config) => {
    try {
      let stressLevel = 0;
      let dominantExpression = 'neutral';
      let maxCount = 0;
      
      const counts = expressionCounts.current;
      const totalExpressions = Object.values(counts).reduce((a, b) => a + b, 0);
      
      if (totalExpressions > 0) {
        const negativeExpressions = counts.fearful + counts.sad + counts.angry + counts.disgusted;
        stressLevel = Math.round((negativeExpressions / totalExpressions) * 100);
        
        for (const [exp, count] of Object.entries(counts)) {
          if (count > maxCount) {
            maxCount = count;
            dominantExpression = exp;
          }
        }
      }

      const totalFrames = faceDetectionCounts.current.total;
      const detectedFrames = faceDetectionCounts.current.detected;
      const eyeContactScore = totalFrames > 0 ? Math.round((detectedFrames / totalFrames) * 100) : 0;

      // NEW: flag whether we actually captured usable data
      const hasVideoData = detectedFrames > 0;

      const videoMetrics = { stressLevel, eyeContactScore, dominantExpression, hasVideoData };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/interviews/${id}/complete`, { videoMetrics, proctoringWarnings: warningsRef.current }, config);
      navigate(`/interview/${id}/results`);
    } catch (err) {
      console.error(err);
    }
  };

  const runCode = async () => {
    setIsExecuting(true);
    setCodeOutput('Executing...');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const versionMap = { javascript: '18.15.0', python: '3.10.0', java: '15.0.2', cpp: '10.2.0', react: '18', html: '5', css: '3', angular: '18', typescript: '5.0', go: '1.20', php: '8.2', ruby: '3.2', rust: '1.68', csharp: '11' };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/code/execute`,
        { language: codeLanguage, version: versionMap[codeLanguage] || '*', sourceCode: codeAnswer },
        config
      );

      setCodeOutput(data.run.output || data.compile?.output || 'Code executed successfully with no output.');
    } catch (err) {
      setCodeOutput('Error executing code: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const submitAnswer = async (finalAnswer, isEndRequested = false) => {
    if (!finalAnswer && finalAnswer !== 'SKIPPED_QUESTION') {
      if (showCodeEditor) {
        finalAnswer = codeAnswer.trim();
        if (answer.trim()) {
          finalAnswer = `[THEORY/EXPLANATION]:\n${answer.trim()}\n\n[CODE IMPLEMENTATION]:\n${codeAnswer.trim()}`;
        }
      } else {
        finalAnswer = answer.trim();
      }
    }
    if (!finalAnswer) return;

    setSubmitting(true);
    setAiState('evaluating');
    window.speechSynthesis.cancel();
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/${id}/answer`,
        { questionIndex: currentQuestionIndex, answer: finalAnswer, endInterview: isEndRequested, proctoringWarnings: warningsRef.current },
        config
      );
      
      setAnswer('');
      setCodeAnswer('');
      setCodeOutput('');
      if (interview?.interviewType !== 'Coding') setShowCodeEditor(false);
      setSubmitting(false);
      if (isEndRequested) {
        completeInterview(config);
      } else {
        fetchInterview();
      }
    } catch (err) {
      setSubmitting(false);
      setAiState('idle');
      toast.error('Failed to evaluate answer. Using fallback mode.');
      setTimeout(() => fetchInterview(), 2000); 
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

  // Determine AI Pulse Color
  const getAiPulseColor = () => {
    if (aiState === 'speaking') return 'bg-emerald-500 border-emerald-500/20';
    if (aiState === 'listening') return 'bg-indigo-500 border-indigo-500/20';
    if (aiState === 'evaluating') return 'bg-amber-500 border-amber-500/20';
    return 'bg-slate-600 border-slate-600/20';
  };
  
  const getAiText = () => {
    if (aiState === 'speaking') return 'Speaking...';
    if (aiState === 'listening') return 'Listening...';
    if (aiState === 'evaluating') return 'Evaluating...';
    return 'Idle';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      

      {/* Session Start Overlay (Required for Audio permissions) */}
      <AnimatePresence>
        {!sessionStarted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl text-center max-w-md">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                <Mic size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Ready to begin?</h2>
              <p className="text-slate-400 mb-8">
                The AI recruiter will automatically speak the questions. Your microphone will automatically activate when it's your turn to speak.
              </p>
              <button 
                onClick={() => { setSessionStarted(true); sessionStartedRef.current = true; }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Start Interview Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shadow-md flex flex-col md:flex-row justify-between items-center px-4 md:px-8 gap-4">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
          <h1 className="text-xl font-bold text-slate-200">AI Interview Session</h1>
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-700">
            {interview.interviewType === 'Gov Exam' ? interview.role : `${interview.role} (${interview.experience})`}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-slate-400 font-medium">
            Question {currentQuestionIndex + 1} of {interview.totalQuestions || interview.questions.length}
          </div>
          <div className={`flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-lg border ${timeLeft < 30 ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-700'}`}>
            <Timer size={18} className={timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-indigo-400'} />
            <span className={`font-mono font-bold text-lg ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Video Panels & Proctoring Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto md:h-[45vh]">
          {/* AI Panel */}
          <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex flex-col items-center justify-center min-h-[300px]">
            <div className={`absolute inset-0 border-4 rounded-2xl transition-all duration-500 ${getAiPulseColor().split(' ')[1]}`}></div>
            
            <div className="relative">
              {/* Pulse rings */}
              {aiState !== 'idle' && (
                <>
                  <div className={`absolute inset-0 rounded-full ${getAiPulseColor().split(' ')[0]}/20 animate-ping`}></div>
                  <div className={`absolute -inset-4 rounded-full ${getAiPulseColor().split(' ')[0]}/10 animate-pulse`}></div>
                </>
              )}
              
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center z-10 relative shadow-[0_0_30px_rgba(99,102,241,0.5)] border-4 border-slate-900">
                <span className="text-4xl font-black text-white tracking-widest">AI</span>
              </div>
            </div>
            
            <div className="mt-8 text-center z-10">
              <h3 className="text-xl font-bold text-slate-200">AI Panelist</h3>
              <p className={`mt-1 font-medium ${aiState === 'speaking' ? 'text-emerald-400' : aiState === 'listening' ? 'text-indigo-400' : aiState === 'evaluating' ? 'text-amber-400' : 'text-slate-500'}`}>
                {getAiText()}
              </p>
            </div>
          </div>

          {/* User Webcam Panel */}
          <div className="lg:col-span-5 bg-black rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex flex-col items-center justify-center min-h-[300px]">
            {isCameraOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-600 bg-slate-900">
                <CameraOff size={48} className="mb-4" />
                <span className="text-lg">Camera Off</span>
              </div>
            )}
            
            {/* Recording indicator */}
            <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border ${isListening ? 'border-red-500/50' : 'border-slate-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-slate-600'}`}></div>
              <span className={`text-xs font-bold tracking-wider uppercase ${isListening ? 'text-slate-200' : 'text-slate-500'}`}>
                {isListening ? 'Live Mic' : 'Mic Off'}
              </span>
            </div>
            
            {/* User Name Tag */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg border border-slate-700 px-4 py-2">
              <span className="text-sm font-medium text-slate-200">Candidate</span>
            </div>

            <button 
              onClick={toggleCamera}
              className="absolute bottom-4 right-4 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition-colors backdrop-blur-md border border-slate-700"
            >
              {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>
          </div>

          {/* Proctoring Panel */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 flex flex-col min-h-[300px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="text-red-500" size={14} /> Proctoring Panel
            </h3>
            <div className="mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Candidate</p>
              <p className="text-sm font-bold text-slate-200 line-clamp-1">
                {JSON.parse(localStorage.getItem('userInfo'))?.name || 'Unknown'}
              </p>
            </div>
            <div className="flex-1 flex flex-col">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Live Warnings</p>
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                  <span className="text-xs font-medium text-slate-400">Tab Switch</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${warnings.tabSwitch > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>{warnings.tabSwitch}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                  <span className="text-xs font-medium text-slate-400">Face Missing/Multi</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${warnings.faceMissing > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>{warnings.faceMissing}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                  <span className="text-xs font-medium text-slate-400">Mic Off</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${warnings.micOff > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>{warnings.micOff}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                  <span className="text-xs font-medium text-slate-400">Copy/Paste</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${warnings.copyPaste > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>{warnings.copyPaste}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question & Input Area */}
        <motion.div 
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col"
        >
          {/* Question Text */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start gap-4">
            <h2 className="text-2xl font-medium text-slate-100 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
            <button
              onClick={() => handleAutomatedIntro(currentQuestionIndex, interview.totalQuestions || interview.questions.length, currentQuestion.questionText)}
              className="shrink-0 p-3 text-indigo-400 bg-indigo-500/10 rounded-full hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
              title="Repeat Question"
            >
              <Volume2 size={20} />
            </button>
          </div>

          {/* Input Area */}
          <div className="flex-grow p-6 flex flex-col">
            <AnimatePresence mode="wait">
              {!showCodeEditor ? (
                <motion.div 
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-grow flex flex-col"
                >
                  <textarea
                    className={`flex-grow w-full rounded-xl border bg-slate-950/50 p-5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg resize-none shadow-inner ${isListening ? 'border-red-500/50 bg-red-950/10' : 'border-slate-800'}`}
                    placeholder={aiState === 'speaking' ? "Listen to the interviewer..." : isListening ? "Listening... speak clearly into your microphone" : "Type your answer here, or use the microphone..."}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={submitting || aiState === 'speaking'}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px] sm:h-[500px] lg:h-64"
                >
                  {/* Editor */}
                  <div className="flex flex-col rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                    <div className="bg-slate-900 px-4 py-2.5 flex justify-between items-center border-b border-slate-800">
                      <select
                        className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
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
                      <button
                        onClick={runCode}
                        disabled={isExecuting}
                        className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 text-sm px-4 py-1.5 rounded-lg hover:bg-emerald-600/30 transition-colors flex items-center gap-2"
                      >
                        {isExecuting ? 'Running...' : <><Play size={14} /> Run</>}
                      </button>
                    </div>
                    <div className="flex-grow bg-[#1e1e1e]">
                      <Editor
                        height="100%"
                        language={['python', 'java', 'cpp', 'html', 'css', 'typescript', 'php', 'ruby', 'rust', 'csharp', 'go'].includes(codeLanguage) ? codeLanguage : 'javascript'}
                        theme="vs-dark"
                        value={codeAnswer}
                        onChange={(val) => setCodeAnswer(val || '')}
                        options={{ minimap: { enabled: false }, fontSize: 14 }}
                      />
                    </div>
                  </div>

                  {/* Terminal Output */}
                  <div className="flex flex-col rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-black">
                    <div className="bg-slate-900 px-4 py-2.5 flex items-center gap-2 border-b border-slate-800">
                      <Terminal size={14} className="text-slate-500" />
                      <span className="text-slate-400 text-sm font-medium">Output</span>
                    </div>
                    <div className="p-4 text-emerald-400 font-mono text-sm overflow-auto whitespace-pre-wrap flex-grow">
                      {codeOutput || <span className="text-slate-600">Run code to see output...</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={toggleListening}
                disabled={aiState === 'speaking' || submitting}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 ${isListening ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'}`}
              >
                {isListening ? <><MicOff size={18} /> Stop Recording</> : <><Mic size={18} /> Voice Answer</>}
              </button>
              {interview.interviewType !== 'Gov Exam' && (
                <button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  disabled={aiState === 'speaking' || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                >
                  {showCodeEditor ? <><Terminal size={18} /> Text</> : <><Code2 size={18} /> Code</>}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => submitAnswer(answer.trim() || 'SKIPPED_QUESTION', true)}
                disabled={submitting || aiState === 'evaluating'}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                End Interview
              </button>
              <button
                onClick={handleManualSkip}
                disabled={submitting || aiState === 'evaluating'}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <SkipForward size={18} />
                Skip
              </button>
              <button
                onClick={() => submitAnswer()}
                disabled={submitting || (!codeAnswer.trim() && !answer.trim() && !isListening)}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submitting ? '...' : isLastQuestion ? 'Finish 🚀' : <><Send size={18} /> Submit</>}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default InterviewSession;
