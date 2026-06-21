import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ChevronRight, ChevronLeft, 
  UploadCloud, Play, CheckCircle2, FileText, Settings, Sparkles, Users
} from 'lucide-react';

const THEME = {
  bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
  cardBg: "bg-indigo-950/40 border-indigo-500/30",
  accent: "text-indigo-400",
  borderActive: "border-indigo-500",
  glow: "shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
  button: "bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400",
  icon: <Building2 className="w-8 h-8" />
};

const POPULAR_COMPANIES = [
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "TCS", logo: "https://www.google.com/s2/favicons?domain=tcs.com&sz=128" },
  { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
  { name: "Accenture", logo: "https://www.google.com/s2/favicons?domain=accenture.com&sz=128" },
  { name: "Cognizant", logo: "https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg" },
  { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" }
];

const CompanyInterviewSetup = ({ passedCompany = '', onSubmit, loading, loadingText }) => {
  const [step, setStep] = useState(1);
  
  // Step 1: Target Company
  const [company, setCompany] = useState(passedCompany || 'Google');
  
  // Step 2: Candidate Profile
  const [resumeFile, setResumeFile] = useState(null);
  
  // Step 3: Focus & Tone
  const [focus, setFocus] = useState('Mixed');
  const [panelTone, setPanelTone] = useState('Standard');

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      company,
      role: 'General Candidate',
      level: 'N/A',
      skills: '',
      focus,
      panelTone,
      resumeFile
    });
  };

  return (
    <div className={`min-h-[80vh] relative rounded-3xl overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${THEME.bgGradient} border border-slate-800 shadow-2xl`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        
        {/* Progress Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0"></div>
            <div 
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-500 bg-gradient-to-r ${THEME.button.split(' ')[0]}`}
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {['Target Company', 'Resume Upload', 'Settings'].map((label, i) => {
              const isActive = step >= i + 1;
              const isCurrent = step === i + 1;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-1 sm:gap-2 text-center max-w-[80px] sm:max-w-none">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 text-sm sm:text-base ${isActive ? THEME.button + ' text-white shadow-lg' : 'bg-slate-800 text-slate-500'} ${isCurrent ? 'ring-4 ring-slate-900/50 scale-110' : ''}`}>
                    {isActive && !isCurrent ? <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" /> : i + 1}
                  </div>
                  <span className={`text-[10px] sm:text-sm font-medium leading-tight ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel Container */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: TARGET COMPANY */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className={`backdrop-blur-xl border rounded-3xl p-5 sm:p-8 ${THEME.cardBg} transition-all duration-500 max-w-3xl mx-auto`}
              >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                  <Building2 className={`w-8 h-8 ${THEME.accent}`} />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Target Company</h2>
                    <p className="text-sm text-slate-400">Select the company whose interview style you want to simulate.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {POPULAR_COMPANIES.map(c => {
                    const isSelected = company === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setCompany(c.name)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected ? `${THEME.borderActive} bg-slate-800 shadow-md scale-105` : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'}`}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
                          <img 
                            src={c.logo} 
                            alt={c.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${c.name}&background=random&color=fff`;
                            }}
                          />
                        </div>
                        <span className={`font-bold text-sm ${isSelected ? THEME.accent : 'text-slate-300'}`}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={handleNext}
                    disabled={!company}
                    className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-white transition-all text-sm sm:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${THEME.button}`}
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: RESUME UPLOAD */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className={`backdrop-blur-xl border rounded-3xl p-5 sm:p-8 ${THEME.cardBg} transition-all duration-500 max-w-3xl mx-auto`}
              >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                  <FileText className={`w-8 h-8 ${THEME.accent}`} />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Upload Your Resume</h2>
                    <p className="text-sm text-slate-400">Provide your resume so the panel can tailor their questions to your background.</p>
                  </div>
                </div>

                <div>
                  <label className="border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 bg-indigo-950/20 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group">
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    <UploadCloud className="w-12 h-12 text-indigo-400 mb-4 group-hover:-translate-y-2 transition-transform" />
                    <span className="text-slate-200 font-bold text-center text-sm sm:text-lg break-all">
                      {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 mt-2 text-center">PDF format only. The AI will extract your skills automatically.</span>
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 pt-6 border-t border-white/10 gap-4">
                  <button onClick={handlePrev} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button onClick={handleNext} className={`flex items-center justify-center gap-2 px-4 sm:px-8 py-3 rounded-xl font-bold text-white transition-all text-sm sm:text-base ${THEME.button}`}>
                    Settings <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SETTINGS & START */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className={`backdrop-blur-xl border rounded-3xl p-5 sm:p-8 ${THEME.cardBg} transition-all duration-500 max-w-3xl mx-auto`}
              >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                  <Settings className={`w-8 h-8 ${THEME.accent}`} />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{company} Interview Settings</h2>
                    <p className="text-sm text-slate-400">Configure what the {company} panel will test you on.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  
                  {/* Interview Focus */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" /> Interview Focus
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'Algorithms', desc: 'Focus strictly on Data Structures & Logic' },
                        { id: 'System Design', desc: 'Focus on Architecture & Scalability' },
                        { id: `Company Culture`, desc: `Focus on ${company}'s specific core values & principles` },
                        { id: 'Mixed', desc: 'A standard mix of technical and behavioral' }
                      ].map(type => (
                        <button
                          key={type.id} onClick={() => setFocus(type.id)}
                          className={`p-4 rounded-xl border-2 transition-colors text-left ${focus === type.id ? `${THEME.borderActive} bg-slate-800 shadow-md` : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}
                        >
                          <h4 className={`font-bold mb-1 ${focus === type.id ? THEME.accent : 'text-slate-300'}`}>{type.id}</h4>
                          <p className="text-xs text-slate-500">{type.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Panel Tone */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" /> Panel Tone
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Friendly', 'Standard', 'Bar Raiser'].map(type => (
                        <button
                          key={type} onClick={() => setPanelTone(type)}
                          className={`p-4 rounded-xl border-2 transition-colors text-left ${panelTone === type ? `${type === 'Bar Raiser' ? 'border-red-500' : THEME.borderActive} bg-slate-800 shadow-md` : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}
                        >
                          <h4 className={`font-bold mb-1 ${panelTone === type ? (type === 'Bar Raiser' ? 'text-red-400' : THEME.accent) : 'text-slate-300'}`}>{type}</h4>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 sm:mt-12 pt-6 border-t border-white/10 gap-4">
                  <button onClick={handlePrev} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all text-sm sm:text-base disabled:opacity-50 ${THEME.button} ${THEME.glow}`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {loadingText || 'Preparing Panel...'}
                      </div>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        Start Interview
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default CompanyInterviewSetup;
