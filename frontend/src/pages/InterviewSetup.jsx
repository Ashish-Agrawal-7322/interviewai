import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Play, UploadCloud, FileText, CheckCircle2, X } from 'lucide-react';
import GovExamSetup from '../components/GovExamSetup';
import CompanyInterviewSetup from '../components/CompanyInterviewSetup';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillMode = location.state?.mode || null;
  const passedCompany = location.state?.company || '';
  const isGovMode = prefillMode === 'gov';
  // isCodingMode will be determined dynamically from interviewType state.

  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('Fresher (0 years)');
  
  // Gov Exam States
  const [language, setLanguage] = useState('English');
  const [graduation, setGraduation] = useState('');
  const [optionalSubject, setOptionalSubject] = useState('');
  const [hometown, setHometown] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [achievements, setAchievements] = useState('');
  
  // Determine initial interview type based on prefill mode
  const getInitialType = () => {
    if (prefillMode === 'standard') return 'Technical';
    if (prefillMode === 'gov') return 'Gov Exam';
    if (prefillMode === 'coding') return 'Coding';
    if (prefillMode === 'resume') return 'Resume';
    if (prefillMode === 'company') return 'Company';
    return 'Technical';
  };
  
  const [interviewType, setInterviewType] = useState(getInitialType());
  const isCodingMode = interviewType === 'Coding';
  const isResumeMode = prefillMode === 'resume';
  const isStandardMode = prefillMode === 'standard';
  const isCompanyMode = prefillMode === 'company';

  // Automatically adjust default experience strings based on mode
  useEffect(() => {
    if (isCodingMode && !['Easy', 'Medium', 'Hard'].includes(experience)) {
      setExperience('Medium');
    } else if (!isCodingMode && ['Easy', 'Medium', 'Hard'].includes(experience)) {
      setExperience('Fresher (0 years)');
    }
  }, [isCodingMode]);
  
  // Resume state
  const [resumeFile, setResumeFile] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (!user) navigate('/login');
  }, [navigate]);

  // Force interview type if a specific mode is passed from dashboard
  useEffect(() => {
    if (prefillMode) {
      setInterviewType(getInitialType());
    }
  }, [prefillMode]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      let resumeSkills = [];

      // If a resume is attached, parse it first
      if (resumeFile && !isGovMode) {
        setLoadingText('Analyzing Resume...');
        const formData = new FormData();
        formData.append('resume', resumeFile);
        
        // Multi-part form data for upload
        const uploadConfig = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/resumes/upload`, formData, uploadConfig);
        resumeSkills = uploadRes.data.extractedSkills;
      }

      setLoadingText('Generating Questions...');

      // Prepare Gov details if applicable
      const govDetails = isGovMode ? {
        graduation,
        optionalSubject,
        hometown,
        workExperience,
        hobbies,
        achievements
      } : null;

      // Generate the interview
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/generate`,
        { 
          role: isResumeMode ? 'Resume Based' : isCompanyMode ? 'General Candidate' : role, 
          experience: isGovMode || isResumeMode || isCompanyMode ? 'N/A' : experience, 
          interviewType: isResumeMode ? 'Resume' : isCompanyMode ? 'Company' : interviewType,
          resumeSkills,
          targetCompany: isCompanyMode ? passedCompany : undefined,
          language,
          govDetails
        },
        config
      );

      if (interviewType === 'Coding') {
        navigate(`/coding-session/${data._id}`);
      } else {
        navigate(`/interview/${data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleGovSubmit = async (govPayload) => {
    setLoading(true);
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      setLoadingText('Preparing Panel...');
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/generate`,
        { 
          role: govPayload.role, 
          experience: 'N/A', 
          interviewType: 'Gov Exam',
          language: govPayload.language,
          govDetails: govPayload.govDetails
        },
        config
      );
      navigate(`/interview/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleCompanySubmit = async (companyPayload) => {
    setLoading(true);
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      let resumeSkills = companyPayload.skills ? companyPayload.skills.split(',').map(s => s.trim()) : [];
      if (companyPayload.resumeFile) {
        setLoadingText('Analyzing Resume...');
        const formData = new FormData();
        formData.append('resume', companyPayload.resumeFile);
        const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` } };
        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/resumes/upload`, formData, uploadConfig);
        resumeSkills = [...resumeSkills, ...uploadRes.data.extractedSkills];
      }
      setLoadingText('Preparing Panel...');
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/generate`,
        { 
          role: companyPayload.role, 
          experience: companyPayload.level, 
          interviewType: 'Company',
          language: 'English',
          targetCompany: companyPayload.company,
          resumeSkills: resumeSkills,
          companyDetails: {
            focus: companyPayload.focus,
            panelTone: companyPayload.panelTone
          }
        },
        config
      );
      navigate(`/interview/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      setLoadingText('');
    }
  };

  if (isGovMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-5xl mx-auto"><X size={16}/> {error}</div>}
        <GovExamSetup onSubmit={handleGovSubmit} loading={loading} loadingText={loadingText} />
      </div>
    );
  }

  if (isCompanyMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-5xl mx-auto"><X size={16}/> {error}</div>}
        <CompanyInterviewSetup passedCompany={passedCompany} onSubmit={handleCompanySubmit} loading={loading} loadingText={loadingText} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center max-w-3xl mx-auto"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
          {isGovMode ? 'Gov Exam Setup' : isCompanyMode ? `${passedCompany} Interview Setup` : prefillMode === 'coding' ? 'Coding Interview Setup' : isStandardMode ? 'Standard Interview Setup' : 'Configure Your Interview'}
        </h1>
        <p className="text-lg text-slate-400">
          {isGovMode ? 'Fill out your DAF details to generate highly specific questions.' : isCompanyMode ? `You are about to start a targeted mock interview for ${passedCompany}. No resume required.` : prefillMode === 'coding' ? 'Select difficulty to begin your coding assessment.' : isStandardMode ? 'Set up your standard corporate mock interview. Choose your focus area and optionally upload a resume.' : 'Upload your resume for highly targeted, personalized questions.'}
        </p>
      </motion.div>

      <form onSubmit={submitHandler} className="max-w-5xl mx-auto">
        <div className={`grid grid-cols-1 ${isResumeMode || isCompanyMode ? 'max-w-2xl mx-auto' : 'lg:grid-cols-2'} gap-8`}>
          
          {/* Left Column: Basic Details */}
          {!isResumeMode && !isCompanyMode && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-slate-900/60 backdrop-blur-xl border ${isGovMode ? 'border-emerald-800' : 'border-slate-800'} shadow-2xl rounded-3xl p-8`}
          >
            <div className={`flex items-center gap-3 mb-8 pb-4 border-b ${isGovMode ? 'border-emerald-800/50' : 'border-slate-800'}`}>
              <div className={`p-3 rounded-xl ${isGovMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                <SlidersHorizontal size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">Session Details</h2>
            </div>
            
            {error && <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2"><X size={16}/> {error}</div>}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                  {isGovMode ? 'Exam Name / Board' : isCodingMode ? 'Tech Domain / Stack' : 'Target Role / Job Title'}
                </label>
                {isGovMode ? (
                  <select
                    id="role"
                    required
                    className={`w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 transition-all shadow-inner focus:ring-emerald-500 focus:border-emerald-500 appearance-none`}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select Exam...</option>
                    <option value="UPSC CSE">UPSC CSE</option>
                    <option value="BPSC">BPSC</option>
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="Banking PO/Clerk">Banking PO/Clerk</option>
                    <option value="Railway">Railway</option>
                    <option value="CDS">CDS</option>
                    <option value="CAPF">CAPF</option>
                    <option value="State PCS">State PCS</option>
                    <option value="Other Government Exam">Other Government Exam</option>
                  </select>
                ) : (
                  <input
                    id="role"
                    type="text"
                    required
                    className={`w-full bg-slate-950/50 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 transition-all shadow-inner focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder={isCodingMode ? "e.g. Frontend, Backend, Machine Learning" : "e.g. Frontend Developer, Data Scientist"}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                )}
              </div>


              {!isGovMode && !isCodingMode && (
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                  <select
                    id="experience"
                    className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner appearance-none"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="Fresher (0 years)">Fresher (0 years)</option>
                    <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                    <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
                    <option value="Senior Level (5+ years)">Senior Level (5+ years)</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              )}

              {isStandardMode && (
                <div>
                  <label htmlFor="interviewType" className="block text-sm font-medium text-slate-300 mb-2">Interview Focus</label>
                  <select
                    id="interviewType"
                    className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner appearance-none"
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                  >
                    <option value="Technical">Technical (Hard Skills & Domain Knowledge)</option>
                    <option value="Behavioral">HR / Behavioral (Soft Skills & Culture Fit)</option>
                    <option value="Mixed">Mixed (Both Technical and HR)</option>
                  </select>
                </div>
              )}

              {isCodingMode && (
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-2">Difficulty Level</label>
                  <select
                    id="experience"
                    className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner appearance-none"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              )}

            </div>
          </motion.div>
          )}

          {/* Right Column: Resume & Submit */}
          <div className="flex flex-col gap-8">
            
            <AnimatePresence>
              {isGovMode ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-900/60 backdrop-blur-xl border border-emerald-800 shadow-2xl rounded-3xl p-8 flex-1 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-800/50">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">Detailed Application Form (DAF)</h2>
                      <p className="text-sm text-slate-400">The panel will heavily grill you on these fields.</p>
                    </div>
                  </div>

                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[60vh]">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Graduation / Degree</label>
                      <input type="text" placeholder="e.g. B.Tech Mechanical" className="w-full bg-slate-950/50 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={graduation} onChange={(e) => setGraduation(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Optional Subject</label>
                      <input type="text" placeholder="e.g. Sociology, Public Admin" className="w-full bg-slate-950/50 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={optionalSubject} onChange={(e) => setOptionalSubject(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Hometown / District / State</label>
                      <input type="text" placeholder="e.g. Lucknow, Uttar Pradesh" className="w-full bg-slate-950/50 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={hometown} onChange={(e) => setHometown(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Work Experience (Optional)</label>
                      <input type="text" placeholder="e.g. 2 years as Software Engg at TCS" className="w-full bg-slate-950/50 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={workExperience} onChange={(e) => setWorkExperience(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Hobbies & Interests</label>
                      <input type="text" placeholder="e.g. Reading History, Playing Chess" className="w-full bg-slate-950/50 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={hobbies} onChange={(e) => setHobbies(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Extra Curricular / Achievements</label>
                      <textarea placeholder="e.g. NCC Cadet, Gold Medalist" rows={2} className="w-full bg-slate-950/50 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={achievements} onChange={(e) => setAchievements(e.target.value)} />
                    </div>
                  </div>
                </motion.div>
              ) : !isCompanyMode ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.2 }}
                  className={`bg-slate-900/60 backdrop-blur-xl border ${isStandardMode ? 'border-indigo-800' : 'border-slate-800'} shadow-2xl rounded-3xl p-8 flex-1 flex flex-col`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${isStandardMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-100">Resume Context</h2>
                      <p className="text-sm text-slate-400">Optional. Upload to generate personalized questions.</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/30 hover:bg-slate-950/50 hover:border-indigo-500/50 transition-colors relative p-6 text-center">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {!resumeFile ? (
                      <>
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-lg text-slate-400">
                          <UploadCloud size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-200 mb-1">Upload PDF Resume</h3>
                        <p className="text-slate-500 text-sm max-w-xs">Drag and drop or click to browse. Questions will be strictly tailored to your skills.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mb-4 shadow-lg text-emerald-400">
                          <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-emerald-400 mb-1">Resume Attached</h3>
                        <p className="text-slate-400 text-sm break-all truncate max-w-[200px]">{resumeFile.name}</p>
                        <p className="text-indigo-400 text-xs mt-4 font-medium uppercase tracking-wider">Click to replace</p>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : null}
              {isCompanyMode && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 shadow-2xl rounded-3xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500 left-0"></div>
                  
                  <img 
                    src={`https://logo.clearbit.com/${passedCompany?.toLowerCase().replace(/\s+/g, '')}.com`} 
                    alt={`${passedCompany} logo`} 
                    className="w-24 h-24 mb-6 rounded-3xl shadow-2xl bg-white/5 p-3 object-contain backdrop-blur-md border border-white/10"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  
                  <h2 className="text-3xl font-extrabold text-white mb-4">
                    Ready for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{passedCompany}</span> Interview?
                  </h2>
                  <p className="text-slate-400 max-w-md mx-auto mb-2 text-lg leading-relaxed">
                    The AI has been pre-configured to act as a strict hiring manager from {passedCompany}. 
                  </p>
                  <p className="text-slate-500 max-w-md mx-auto text-sm">
                    Questions will be dynamically tailored to test your alignment with their specific engineering culture and core principles.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="submit"
                disabled={loading || (isResumeMode ? !resumeFile : isCompanyMode ? false : !role)}
                className={`w-full flex items-center justify-center gap-3 py-5 px-6 font-bold rounded-3xl text-white text-lg shadow-2xl disabled:opacity-50 transition-all transform hover:-translate-y-1 ${
                  isGovMode 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30 hover:shadow-emerald-500/50' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 hover:shadow-indigo-500/50'
                }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {loadingText || 'Starting...'}
                    </div>
                  </div>
                ) : (
                  <>
                    <Play size={24} fill="currentColor" />
                    Start Interview Session
                  </>
                )}
              </button>
            </motion.div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetup;
