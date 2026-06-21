import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Code2, LineChart, Mic, Sparkles, Star, ArrowRight, Zap, Globe, MessageSquare, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const Home = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 overflow-hidden relative">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-20">
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center min-h-[85vh] flex flex-col justify-center -mt-20"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(129,140,248,0.3)] backdrop-blur-md mb-8 mx-auto cursor-pointer overflow-hidden hover:shadow-[0_0_30px_rgba(129,140,248,0.5)] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 opacity-100"></div>
            <Sparkles size={16} className="text-purple-400 animate-pulse relative z-10" />
            <span className="text-sm font-medium text-white relative z-10">
              Powered by AI
            </span>
            <ArrowRight size={16} className="ml-1 text-purple-300 group-hover:translate-x-1 transition-transform relative z-10" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400">
            Master Your Next <br /> Technical Interview
          </h1>
          
          <p className="mt-6 text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Get instantly matched with live jobs, upload your resume for an ATS score, practice live coding, speak naturally, and get real-time AI feedback to land your dream role.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} className="fill-current" />
                Start Interview
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-200 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-700 backdrop-blur-sm transition-all"
              >
                Login
              </motion.button>
            </Link>
          </div>
        </motion.div>


        {/* HOW IT WORKS SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mt-40 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">How it works</h2>
          <p className="text-lg text-slate-400 mb-16 max-w-2xl mx-auto">Three simple steps to prepare for any technical interview and walk in with absolute confidence.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 z-0"></div>
            
            <StepCard 
              number="01"
              title="Upload Resume"
              desc="We extract your skills and generate customized interview questions tailored strictly to your profile."
            />
            <StepCard 
              number="02"
              title="Mock Interview"
              desc="Face our AI in a realistic voice or coding interview environment with strict time limits."
            />
            <StepCard 
              number="03"
              title="Get Feedback"
              desc="Receive detailed scorecards, actionable insights, and code optimizations to improve fast."
            />
          </div>
        </motion.div>
        {/* COMPREHENSIVE FEATURES SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mt-40"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Everything You Need to Succeed</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">A complete suite of AI-powered tools designed to help you land your dream tech role.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Globe className="text-indigo-400" size={32} />}
              title="Live AI Job Matchmaker"
              desc="We pull real, active job postings using JSearch and use AI to find the perfect matches for your unique skill set."
            />
            <FeatureCard 
              icon={<MessageSquare className="text-pink-400" size={32} />}
              title="Behavioral Analysis"
              desc="Our AI analyzes your webcam feed to track micro-expressions and eye contact to ensure you project confidence."
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-400" size={32} />}
              title="ATS Resume Scanner"
              desc="Upload your PDF resume to instantly extract your core skills, identify gaps, and get a real ATS match score."
            />
            <FeatureCard 
              icon={<Code2 className="text-blue-400" size={32} />}
              title="Interactive Coding Sessions"
              desc="Solve complex algorithmic challenges in a real-time IDE while the AI acts as your pair-programming interviewer."
            />
            <FeatureCard 
              icon={<Star className="text-emerald-400" size={32} />}
              title="DAF Analyzer for Gov Exams"
              desc="Applying for public sector roles? We analyze your Detailed Application Form to generate highly realistic panel questions."
            />
            <FeatureCard 
              icon={<Mic className="text-purple-400" size={32} />}
              title="Hyper-Realistic Voice AI"
              desc="Speak naturally with an interviewer that listens, evaluates, and responds aloud with incredibly low latency."
            />
          </div>
        </motion.div>

        {/* TESTIMONIALS SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px" }}
          variants={fadeInUp}
          className="mt-40"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Loved by Engineers</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">See how our platform has helped developers land roles at top tech companies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="I was failing system design rounds constantly because I'd freeze up. The 'Bar Raiser' mode here is brutal but it genuinely desensitized me to the stress. I finally cleared L4 at Stripe last week!"
              name="Rahul Sharma"
              role="Backend Engineer"
            />
            <TestimonialCard 
              quote="Honestly, the best part isn't even the coding IDE, it's the behavioral analysis. I didn't realize how often I looked away from the camera until the AI called me out on it. Night and day difference in my confidence."
              name="Priya Patel"
              role="React Developer"
            />
            <TestimonialCard 
              quote="The Live Job Matchmaker is crazy. It pulled an obscure remote startup job I never would have found on LinkedIn, generated questions specifically for their weird tech stack, and I crushed the interview."
              name="Aditya Verma"
              role="Fullstack Developer"
            />
          </div>
        </motion.div>

        {/* FAQ SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mt-40 max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-400">Got questions? We've got answers.</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              question="Is my webcam footage recorded or saved?"
              answer="Absolutely not. All behavioral analysis is done locally in your browser using secure ML models. No video data is ever sent to our servers or saved anywhere."
            />
            <FAQItem 
              question="How does the Job Matchmaker work?"
              answer="We pull live job postings from Google Jobs and LinkedIn via JSearch. Our AI then acts as a recruiter, comparing your resume against the job requirements to find perfect matches."
            />
            <FAQItem 
              question="Which programming languages are supported in the live coding IDE?"
              answer="Currently, our interactive code editor supports JavaScript, Python, Java, and C++. The AI can evaluate your logic and syntax in any of these languages in real-time."
            />
            <FAQItem 
              question="Can I use this to prepare for non-technical roles?"
              answer="Yes! While we specialize in technical interviews, the 'Behavioral' and 'Company Culture' modes are perfect for practicing standard HR and management questions."
            />
            <FAQItem 
              question="How accurate is the ATS Resume Scanner?"
              answer="Extremely accurate. We use the same parsing logic that major Applicant Tracking Systems (like Workday and Lever) use to ensure your resume gets past the robots."
            />
            <FAQItem 
              question="Can I review my past interview performance?"
              answer="Yes! Every mock interview session is saved in your dashboard along with a detailed scorecard, a transcription of your answers, and actionable feedback for improvement."
            />
          </div>
        </motion.div>

        {/* CTA SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mt-40 relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 to-purple-600/10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to ace your next interview?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who are landing their dream jobs by practicing with our AI.
            </p>
            <Link to="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-white/10 hover:shadow-white/20 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                Create Free Account
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 bg-[#0a0f1c]/80 backdrop-blur-xl pt-16 pb-8 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-100 tracking-tight">InterviewAI</span>
              </Link>
              <p className="text-slate-400 text-sm mb-6">
                The ultimate platform for mastering technical interviews with AI-driven mock sessions and actionable analytics.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors"><Globe size={20} /></a>
                <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors"><MessageSquare size={20} /></a>
                <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors"><Mail size={20} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/resume-analyzer" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Resume Analyzer</Link></li>
                <li><Link to="/interview-modes" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Mock Interviews</Link></li>
                <li><Link to="/jobs" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Job Recommendations</Link></li>
                <li><Link to="/dashboard" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Analytics Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">GitHub Repo</a></li>
                <li><Link to="/documentation" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Documentation</Link></li>
                <li><Link to="/support" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-indigo-400 transition-colors text-sm">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Zap size={14} className="text-indigo-400" />
              <span>Built by Ashish Agrawal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable Components
const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition-colors"
  >
    <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-100 mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

const StepCard = ({ number, title, desc }) => (
  <div className="relative z-10 flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-2xl font-bold text-indigo-400 shadow-lg shadow-indigo-500/20 mb-6">
      {number}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400">{desc}</p>
  </div>
);

const TestimonialCard = ({ quote, name, role }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between"
  >
    <div>
      <div className="flex gap-1 mb-6 text-yellow-500">
        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
      </div>
      <p className="text-slate-300 italic mb-8">"{quote}"</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-slate-200">{name}</h4>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      className={`border rounded-xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-indigo-500/50 bg-slate-800/50 shadow-lg shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
      >
        <span className={`font-semibold transition-colors duration-300 ${isOpen ? 'text-indigo-300' : 'text-slate-200'}`}>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className={isOpen ? "text-indigo-400" : "text-slate-500"} size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 text-slate-400 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
