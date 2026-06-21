import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone } from 'lucide-react';

const Support = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pt-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">Support & Help Center</h1>
          <p className="text-xl text-slate-400">We're here to help you succeed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6">
              <Mail size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Email Support</h3>
            <p className="text-slate-400 mb-6">Drop us an email and we'll get back to you within 24 hours.</p>
            <a href="mailto:support@interviewai.com" className="text-indigo-400 font-semibold hover:text-indigo-300">support@interviewai.com</a>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-fuchsia-500/10 text-fuchsia-400 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live Chat</h3>
            <p className="text-slate-400 mb-6">Click the floating AI Orb on the bottom right of any page to chat directly with our intelligent assistant for instant help.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Support;
