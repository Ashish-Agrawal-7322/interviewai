import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, Building2, Briefcase, ChevronRight, ChevronLeft, 
  User, BookOpen, MapPin, Award, GraduationCap, Users, ShieldAlert,
  Play, CheckCircle2, ShieldCheck, Scale, FileText, Settings, Trophy, Shield
} from 'lucide-react';

const THEMES = {
  UPSC: {
    bgGradient: "from-slate-900 via-blue-950 to-slate-900",
    cardBg: "bg-blue-950/40 border-amber-500/30",
    accent: "text-amber-500",
    borderActive: "border-amber-500",
    glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    button: "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400",
    icon: <Scale className="w-8 h-8" />
  },
  BANKING: {
    bgGradient: "from-slate-900 via-teal-950 to-slate-900",
    cardBg: "bg-teal-950/40 border-emerald-500/30",
    accent: "text-emerald-400",
    borderActive: "border-emerald-500",
    glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    button: "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400",
    icon: <Building2 className="w-8 h-8" />
  },
  SSC: {
    bgGradient: "from-slate-900 via-slate-800 to-slate-900",
    cardBg: "bg-slate-800/40 border-sky-500/30",
    accent: "text-sky-400",
    borderActive: "border-sky-500",
    glow: "shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]",
    button: "bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400",
    icon: <Briefcase className="w-8 h-8" />
  },
  DEFAULT: {
    bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
    cardBg: "bg-indigo-950/40 border-indigo-500/30",
    accent: "text-indigo-400",
    borderActive: "border-indigo-500",
    glow: "shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
    button: "bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400",
    icon: <Shield className="w-8 h-8" />
  }
};

// Map of all possible DAF fields with their labels and icons
const DAF_FIELD_DEF = {
  graduation: { label: 'Graduation / Degree', placeholder: 'e.g. B.Tech Mechanical', icon: <GraduationCap className="w-4 h-4"/>, colSpan: 1 },
  optionalSubject: { label: 'Optional Subject', placeholder: 'e.g. Sociology, Public Admin', icon: <BookOpen className="w-4 h-4"/>, colSpan: 1 },
  hometown: { label: 'Hometown / District / State', placeholder: 'e.g. Lucknow, Uttar Pradesh', icon: <MapPin className="w-4 h-4"/>, colSpan: 1 },
  workExperience: { label: 'Work Experience (Optional)', placeholder: 'e.g. 2 years as Software Engg at TCS', icon: <Briefcase className="w-4 h-4"/>, colSpan: 1 },
  hobbies: { label: 'Hobbies & Interests', placeholder: 'e.g. Reading History, Playing Chess', icon: <Award className="w-4 h-4"/>, colSpan: 2 },
  achievements: { label: 'Extra Curricular / Achievements', placeholder: 'e.g. NCC Cadet, Gold Medalist', icon: <Trophy className="w-4 h-4"/>, colSpan: 2, isTextArea: true },
  certifications: { label: 'Certifications / Banking Exams', placeholder: 'e.g. JAIIB, CAIIB, NCFM', icon: <Award className="w-4 h-4"/>, colSpan: 1 },
  preferredService: { label: 'Preferred Service', placeholder: 'e.g. Indian Army / Indian Navy / Air Force', icon: <Shield className="w-4 h-4"/>, colSpan: 1 },
  sports: { label: 'Sports & Physical Achievements', placeholder: 'e.g. State level runner, Black belt', icon: <Trophy className="w-4 h-4"/>, colSpan: 1 }
};

const EXAMS = [
  { 
    id: 'UPSC CSE', name: 'UPSC CSE', theme: 'UPSC', desc: 'Civil Services Examination', boardName: 'UPSC Board',
    dafFields: ['graduation', 'optionalSubject', 'hometown', 'workExperience', 'hobbies', 'achievements']
  },
  { 
    id: 'BPSC', name: 'BPSC', theme: 'UPSC', desc: 'Bihar Public Service Commission', boardName: 'BPSC Board',
    dafFields: ['graduation', 'optionalSubject', 'hometown', 'workExperience', 'hobbies', 'achievements']
  },
  { 
    id: 'SSC CGL', name: 'SSC CGL', theme: 'SSC', desc: 'Combined Graduate Level', boardName: 'SSC Panel',
    dafFields: ['graduation', 'hometown', 'workExperience', 'hobbies', 'achievements']
  },
  { 
    id: 'Banking PO/Clerk', name: 'Banking PO/Clerk', theme: 'BANKING', desc: 'IBPS / SBI Probationary Officer', boardName: 'IBPS Panel',
    dafFields: ['graduation', 'certifications', 'hometown', 'workExperience', 'hobbies']
  },
  { 
    id: 'Railway', name: 'Railway NTPC', theme: 'SSC', desc: 'Non-Technical Popular Categories', boardName: 'RRB Panel',
    dafFields: ['graduation', 'hometown', 'workExperience', 'hobbies']
  },
  { 
    id: 'CDS', name: 'CDS / CAPF', theme: 'DEFAULT', desc: 'Defense Services', boardName: 'SSB Board',
    dafFields: ['graduation', 'preferredService', 'sports', 'hometown', 'workExperience', 'hobbies']
  }
];

const PANEL_MEMBERS = {
  UPSC: [
    { role: 'Chairman', desc: 'Former IAS Officer', icon: <User className="w-5 h-5" /> },
    { role: 'Member 1', desc: 'IR & Polity Expert', icon: <ShieldCheck className="w-5 h-5" /> },
    { role: 'Member 2', desc: 'Economics Expert', icon: <Landmark className="w-5 h-5" /> },
    { role: 'Member 3', desc: 'Tech & Environment', icon: <BookOpen className="w-5 h-5" /> }
  ],
  BANKING: [
    { role: 'Chairman', desc: 'Ex-RBI / SBI Executive', icon: <User className="w-5 h-5" /> },
    { role: 'Member 1', desc: 'Finance & Banking', icon: <Building2 className="w-5 h-5" /> },
    { role: 'Member 2', desc: 'Economy & Tech', icon: <BookOpen className="w-5 h-5" /> }
  ],
  SSC: [
    { role: 'Chairman', desc: 'Joint Secretary', icon: <User className="w-5 h-5" /> },
    { role: 'Member 1', desc: 'Public Admin Expert', icon: <Briefcase className="w-5 h-5" /> },
    { role: 'Member 2', desc: 'Aptitude & HR', icon: <Users className="w-5 h-5" /> }
  ],
  DEFAULT: [
    { role: 'President', desc: 'Senior Defence Officer', icon: <User className="w-5 h-5" /> },
    { role: 'GTO', desc: 'Group Testing Officer', icon: <ShieldCheck className="w-5 h-5" /> },
    { role: 'Psychologist', desc: 'Behavioral Expert', icon: <Users className="w-5 h-5" /> }
  ]
};

const GovExamSetup = ({ onSubmit, loading, loadingText }) => {
  const [step, setStep] = useState(1);
  const [exam, setExam] = useState('');
  
  // Dynamic DAF State
  const [dynamicDaf, setDynamicDaf] = useState({});
  
  // Settings State
  const [difficulty, setDifficulty] = useState('Hard');
  const [panelType, setPanelType] = useState('Standard');

  const selectedExamData = EXAMS.find(e => e.id === exam);
  const themeKey = selectedExamData ? selectedExamData.theme : 'DEFAULT';
  const theme = THEMES[themeKey];
  const board = PANEL_MEMBERS[themeKey] || PANEL_MEMBERS['DEFAULT'];

  // Reset DAF state when exam changes
  useEffect(() => {
    setDynamicDaf({});
  }, [exam]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleDafChange = (field, value) => {
    setDynamicDaf(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const resolvedPanelName = panelType === 'Standard' ? (selectedExamData?.boardName || 'Standard Board') : panelType;
    
    // Attach friendly labels to the DAF payload so the AI knows what they mean
    const enrichedDaf = {};
    Object.keys(dynamicDaf).forEach(key => {
      enrichedDaf[DAF_FIELD_DEF[key]?.label || key] = dynamicDaf[key];
    });

    onSubmit({
      role: exam,
      language: 'English',
      govDetails: {
        dafFields: enrichedDaf,
        difficulty,
        panelType: resolvedPanelName
      }
    });
  };

  return (
    <div className={`min-h-[80vh] relative rounded-3xl overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${theme.bgGradient} border border-slate-800 shadow-2xl`}>
      
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        {theme.icon}
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        
        {/* Progress Bar */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0"></div>
            <div 
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-500 bg-gradient-to-r ${theme.button.split(' ')[0]}`}
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {['Select Exam', 'DAF Details', 'Settings'].map((label, i) => {
              const isActive = step >= i + 1;
              const isCurrent = step === i + 1;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-1 sm:gap-2 text-center max-w-[80px] sm:max-w-none">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 text-sm sm:text-base ${isActive ? theme.button + ' text-white shadow-lg' : 'bg-slate-800 text-slate-500'} ${isCurrent ? 'ring-4 ring-slate-900/50 scale-110' : ''}`}>
                    {isActive && !isCurrent ? <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" /> : i + 1}
                  </div>
                  <span className={`text-[10px] sm:text-sm font-medium leading-tight ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-8 items-start">
          
          {/* Left Panel: Dynamic Board Preview */}
          <AnimatePresence mode="popLayout">
            {step > 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-1/3 hidden lg:block"
              >
                <div className={`backdrop-blur-xl border rounded-3xl p-6 ${theme.cardBg} ${theme.glow} transition-all duration-500`}>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <Users className={`w-6 h-6 ${theme.accent}`} />
                    <h3 className="text-xl font-bold text-white">{selectedExamData?.boardName || 'Interview Board'}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {board.map((member, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors"
                      >
                        <div className={`p-3 rounded-full bg-slate-800 text-slate-300`}>
                          {member.icon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{member.role}</p>
                          <p className="text-sm text-slate-400">{member.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {step === 3 && (
                     <motion.div 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className={`mt-6 p-4 rounded-xl border border-white/10 bg-slate-900/80`}
                     >
                       <div className="flex items-center gap-2 mb-2">
                         <ShieldAlert className={`w-5 h-5 ${difficulty === 'Hard' ? 'text-red-400' : theme.accent}`} />
                         <span className="font-bold text-slate-200">Mode: {panelType === 'Standard' ? selectedExamData?.boardName : panelType}</span>
                       </div>
                       <p className="text-xs text-slate-400">
                         {panelType === 'Stress Interview' ? 'The board will heavily cross-question your DAF and interrupt you.' : 'The board will maintain formal decorum.'}
                       </p>
                     </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Panel: Active Step Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* STEP 1: EXAM SELECTION */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white mb-2">Select Your Target Exam</h2>
                    <p className="text-slate-400">Choose the examination to configure the AI Interview Board.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {EXAMS.map(e => (
                      <button
                        key={e.id}
                        onClick={() => setExam(e.id)}
                        className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${exam === e.id ? `${THEMES[e.theme].borderActive} bg-slate-800/80 shadow-lg scale-[1.02]` : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className={`text-xl font-bold ${exam === e.id ? THEMES[e.theme].accent : 'text-slate-200'}`}>{e.name}</h3>
                          {exam === e.id && <CheckCircle2 className={`w-6 h-6 ${THEMES[e.theme].accent}`} />}
                        </div>
                        <p className="text-sm text-slate-400">{e.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={handleNext}
                      disabled={!exam}
                      className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 rounded-xl font-bold text-white transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${theme.button}`}
                    >
                      Continue to DAF <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DYNAMIC DAF DETAILS */}
              {step === 2 && selectedExamData && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                  className={`backdrop-blur-xl border rounded-3xl p-5 sm:p-8 ${theme.cardBg} transition-all duration-500`}
                >
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                    <FileText className={`w-8 h-8 ${theme.accent}`} />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Application Form ({selectedExamData.id})</h2>
                      <p className="text-sm text-slate-400">The panel will base their questions exclusively on these details.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedExamData.dafFields.map(fieldKey => {
                      const def = DAF_FIELD_DEF[fieldKey];
                      if (!def) return null;
                      
                      return (
                        <div key={fieldKey} className={`space-y-1 ${def.colSpan === 2 ? 'md:col-span-2' : ''}`}>
                          <label className="text-xs font-medium text-slate-400 flex items-center gap-2 mb-1">
                            {def.icon} {def.label}
                          </label>
                          {def.isTextArea ? (
                            <textarea 
                              placeholder={def.placeholder} 
                              rows={2} 
                              className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-inner placeholder-slate-600 focus:ring-white/20" 
                              value={dynamicDaf[fieldKey] || ''} 
                              onChange={(e) => handleDafChange(fieldKey, e.target.value)} 
                            />
                          ) : (
                            <input 
                              type="text" 
                              placeholder={def.placeholder} 
                              className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-inner placeholder-slate-600 focus:ring-white/20" 
                              value={dynamicDaf[fieldKey] || ''} 
                              onChange={(e) => handleDafChange(fieldKey, e.target.value)} 
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 pt-6 border-t border-white/10 gap-4">
                    <button onClick={handlePrev} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                      <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    <button onClick={handleNext} className={`flex items-center justify-center gap-2 px-4 sm:px-8 py-3 rounded-xl font-bold text-white transition-all text-sm sm:text-base ${theme.button}`}>
                      Interview Settings <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SETTINGS & START */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                  className={`backdrop-blur-xl border rounded-3xl p-5 sm:p-8 ${theme.cardBg} transition-all duration-500`}
                >
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                    <Settings className={`w-8 h-8 ${theme.accent}`} />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Interview Settings</h2>
                      <p className="text-sm text-slate-400">Configure the behavior of your AI Panel.</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200 mb-4">Difficulty Level</h3>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {['Easy', 'Medium', 'Hard'].map(level => (
                          <button
                            key={level} onClick={() => setDifficulty(level)}
                            className={`py-2 sm:py-3 text-[11px] sm:text-base rounded-xl border-2 font-bold transition-colors ${difficulty === level ? `${theme.borderActive} bg-slate-800 ${theme.accent}` : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-200 mb-4">Panel Type / Behavior</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Friendly', 'Standard', 'Stress Interview'].map(type => {
                          const displayTitle = type === 'Standard' ? (selectedExamData?.boardName || 'Standard Board') : type;
                          return (
                            <button
                              key={type} onClick={() => setPanelType(type)}
                              className={`p-4 rounded-xl border-2 transition-colors text-left ${panelType === type ? `${theme.borderActive} bg-slate-800` : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'}`}
                            >
                              <h4 className={`font-bold mb-1 ${panelType === type ? theme.accent : 'text-slate-300'}`}>{displayTitle}</h4>
                              <p className="text-xs text-slate-500">
                                {type === 'Friendly' && 'Encouraging and supportive panel.'}
                                {type === 'Standard' && 'Formal, strict, and highly analytical.'}
                                {type === 'Stress Interview' && 'Aggressive cross-questioning.'}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 pt-6 border-t border-white/10 gap-4">
                    <button onClick={handlePrev} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                      <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className={`flex items-center justify-center gap-2 px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 text-sm sm:text-base ${theme.button} ${theme.glow}`}
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
    </div>
  );
};

export default GovExamSetup;
