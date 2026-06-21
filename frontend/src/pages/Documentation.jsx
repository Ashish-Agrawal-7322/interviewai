import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Bot, Target, Briefcase } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pt-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 mb-6">Documentation</h1>
          <p className="text-xl text-slate-400">Everything you need to know about InterviewAI</p>
        </div>

        <div className="space-y-12">
          <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6"><FileText className="text-indigo-400" /> Resume Analyzer</h2>
            <p className="text-slate-300 leading-relaxed mb-4">Our Resume Analyzer uses advanced AI to parse your resume and provide a detailed ATS-compatibility score. Simply upload your PDF, and our system will highlight missing keywords, format issues, and actionable improvements tailored to your target job role.</p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6"><Bot className="text-fuchsia-400" /> AI Mock Interviews</h2>
            <p className="text-slate-300 leading-relaxed mb-4">Practice your interview skills in a completely stress-free, simulated environment. Choose from Behavioral, Technical, or custom difficulty modes. The AI acts as the interviewer, evaluating your speech, confidence, and technical accuracy in real-time.</p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6"><Target className="text-orange-400" /> Real-time Evaluation</h2>
            <p className="text-slate-300 leading-relaxed mb-4">After each session, you receive a comprehensive breakdown of your performance, including tone analysis, filler-word detection, and a personalized roadmap to improve before the real interview.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Documentation;
