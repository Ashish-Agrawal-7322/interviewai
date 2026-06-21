import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const MOCK_QUESTIONS = [
  { id: 1, exam: 'UPSC CSE', category: 'Polity', question: 'What is the doctrine of basic structure? Discuss its evolution.', year: '2022' },
  { id: 2, exam: 'UPSC CSE', category: 'Ethics', question: 'How would you handle a situation where your political boss asks you to bend the rules for a social cause?', year: '2023' },
  { id: 3, exam: 'BPSC', category: 'Bihar Specific', question: 'What are the main reasons for industrial backwardness in Bihar despite having a large demographic dividend?', year: '2021' },
  { id: 4, exam: 'SSC CGL', category: 'General Awareness', question: 'Explain the difference between Repo Rate and Reverse Repo Rate. How does RBI use them?', year: '2023' },
  { id: 5, exam: 'Banking PO/Clerk', category: 'Finance', question: 'What are Non-Performing Assets (NPAs)? What steps has the government taken to reduce them?', year: '2022' },
  { id: 6, exam: 'UPSC CSE', category: 'International Relations', question: 'Critically analyze India\'s stance on the Russia-Ukraine conflict.', year: '2023' },
  { id: 7, exam: 'CAPF', category: 'Internal Security', question: 'What is Left Wing Extremism? Assess the government\'s approach to curbing it.', year: '2020' },
  { id: 8, exam: 'State PCS', category: 'Administration', question: 'As an SDM, how will you manage a sudden communal riot in your district?', year: '2022' },
];

const EXAMS = ['All Exams', 'UPSC CSE', 'BPSC', 'SSC CGL', 'Banking PO/Clerk', 'CAPF', 'State PCS'];

const QuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('All Exams');
  const [expandedId, setExpandedId] = useState(null);

  const filteredQuestions = MOCK_QUESTIONS.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'All Exams' || q.exam === selectedExam;
    return matchesSearch && matchesExam;
  });

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-6">
            <BookOpen className="text-indigo-400" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Previous Year Question Bank
          </h1>
          <p className="text-lg text-slate-400">
            A comprehensive repository of actual interview questions asked in UPSC, State PCS, SSC, and Banking exams.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search questions by keyword or topic..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
          <div className="relative md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner appearance-none"
            >
              {EXAMS.map(exam => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredQuestions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-colors"
              >
                <div 
                  className="p-6 cursor-pointer flex justify-between items-start gap-4"
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md uppercase tracking-wider">
                        {q.exam}
                      </span>
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-md uppercase tracking-wider">
                        {q.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium ml-auto">
                        Asked in {q.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-200 leading-relaxed">
                      {q.question}
                    </h3>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full shrink-0">
                    {expandedId === q.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedId === q.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800 bg-slate-950/30 overflow-hidden"
                    >
                      <div className="p-6 text-slate-400 text-sm leading-relaxed">
                        <p className="mb-4">
                          <strong className="text-slate-300">Approach to Answer:</strong><br />
                          This is a premium feature. The AI can analyze this question and provide a model answer structured using the UPSC framework (Introduction, Body, Conclusion).
                        </p>
                        <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                          <ExternalLink size={16} /> Mock this Question with AI
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">No questions found matching your criteria.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default QuestionBank;
