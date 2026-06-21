import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pt-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-10">
        <h1 className="text-4xl font-extrabold text-white mb-8 border-b border-slate-800 pb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed">When you use InterviewAI, we collect information that you provide to us directly, such as when you create an account, upload a resume for parsing, or participate in AI mock interviews. This includes your name, email address, and professional background.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed">We use the information we collect to provide, maintain, and improve our services. Specifically, your resume data and interview transcripts are processed by our AI models solely to generate personalized feedback, ATS scores, and tailored interview questions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">3. Data Security</h2>
            <p className="leading-relaxed">We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">4. Contact Us</h2>
            <p className="leading-relaxed">If you have any questions about this Privacy Policy, please contact us at privacy@interviewai.com.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
