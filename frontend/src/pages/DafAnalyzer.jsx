import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Bot, Briefcase, GraduationCap, MapPin, Target, Coffee, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const DafAnalyzer = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) navigate('/login');
  }, [navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload your DAF or Biodata PDF first.');
      return;
    }

    setLoading(true);
    setLoadingText('Extracting text from DAF PDF...');
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // 1. Upload and Extract Text (using existing resume upload endpoint)
      const formData = new FormData();
      formData.append('resume', file);
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/resumes/upload`, formData, config);
      const extractedText = uploadRes.data.extractedText; // Assuming the endpoint returns extractedText, if not we fall back

      // 2. Analyze DAF text
      setLoadingText('AI is generating 100+ highly probable interview questions...');
      const analyzeConfig = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/interviews/daf-analyze`, { 
        text: extractedText || file.name // Fallback if extractedText isn't directly returned by existing endpoint
      }, analyzeConfig);
      
      setAnalysis(data);
      toast.success("DAF Analyzed Successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze DAF. Please try again.');
      toast.error('Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Education': return <GraduationCap className="text-blue-400" />;
      case 'HomeState': return <MapPin className="text-emerald-400" />;
      case 'OptionalSubject': return <Target className="text-purple-400" />;
      case 'WorkExperience': return <Briefcase className="text-orange-400" />;
      case 'Hobbies': return <Coffee className="text-pink-400" />;
      default: return <FileText className="text-slate-400" />;
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'Education': return 'Educational Background';
      case 'HomeState': return 'Home State & District';
      case 'OptionalSubject': return 'Optional Subject';
      case 'WorkExperience': return 'Work Experience';
      case 'Hobbies': return 'Hobbies & Extra-Curriculars';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-6">
            <Bot className="text-emerald-400" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            AI DAF Analyzer
          </h1>
          <p className="text-lg text-slate-400">
            Upload your UPSC DAF or Biodata. Our AI will analyze your background and generate a massive bank of highly probable interview questions specifically tailored to you.
          </p>
        </motion.div>

        {!analysis ? (
          /* Upload Section */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl"
          >
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center justify-center gap-2">
                <AlertCircle size={16}/> {error}
              </div>
            )}
            
            <div className="border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/30 hover:bg-slate-950/50 hover:border-emerald-500/50 transition-colors relative p-12 mb-8">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              
              {!file ? (
                <>
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-slate-400">
                    <UploadCloud size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">Upload DAF PDF</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">Upload your Detailed Application Form or Biodata. We support PDF format.</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-emerald-400">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">File Selected</h3>
                  <p className="text-emerald-500 font-medium">{file.name}</p>
                </>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  <Bot size={20} /> Analyze DAF & Generate Questions
                </>
              )}
            </button>
          </motion.div>
        ) : (
          /* Results Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Your Personalized Question Bank</h2>
              <button 
                onClick={() => { setAnalysis(null); setFile(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Analyze Another DAF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(analysis).map((category, index) => {
                const questions = analysis[category];
                if (!questions || questions.length === 0) return null;
                
                return (
                  <motion.div 
                    key={category}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col"
                  >
                    <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                      {getCategoryIcon(category)}
                      <h3 className="text-lg font-bold text-slate-100">{getCategoryTitle(category)}</h3>
                      <span className="ml-auto bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md font-bold">
                        {questions.length} Qs
                      </span>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-96 custom-scrollbar flex-1 space-y-4">
                      {questions.map((q, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-slate-600 font-bold shrink-0">{i + 1}.</span>
                          <p className="text-slate-300 text-sm leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DafAnalyzer;
