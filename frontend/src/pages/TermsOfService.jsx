import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pt-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-10">
        <h1 className="text-4xl font-extrabold text-white mb-8 border-b border-slate-800 pb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">By accessing or using InterviewAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">2. Description of Service</h2>
            <p className="leading-relaxed">InterviewAI provides an AI-powered platform for interview preparation, including resume parsing, automated mock interviews, and performance analytics. We reserve the right to modify or discontinue the service at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">3. User Accounts</h2>
            <p className="leading-relaxed">You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">4. Intellectual Property</h2>
            <p className="leading-relaxed">The service and its original content, features, and functionality are and will remain the exclusive property of InterviewAI and its licensors.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
