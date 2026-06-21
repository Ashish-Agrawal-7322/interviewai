import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Target, ArrowRight, Loader2, Play, Upload, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Fallback Logos if generated company doesn't have an obvious one
const trackJobClick = async (job, userInfo) => {
  try {
    const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
    await axios.post('http://127.0.0.1:5000/api/jobs/click', {
      jobId: job.id || job.title,
      jobTitle: job.title,
      company: job.company
    }, config);
  } catch (err) {
    console.error('Failed to track job click:', err);
  }
};

const getLogoUrl = (companyName) => {
  const c = companyName.toLowerCase();
  if (c.includes('google')) return "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg";
  if (c.includes('amazon')) return "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg";
  if (c.includes('microsoft')) return "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg";
  if (c.includes('meta')) return "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg";
  if (c.includes('apple')) return "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg";
  if (c.includes('netflix')) return "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg";
  if (c.includes('stripe')) return "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg";
  if (c.includes('airbnb')) return "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg";
  
  // Default to Google Favicon API
  const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  return `https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=128`;
};

const JobRecommendations = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('Mid-Level');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchJobs = async (e) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setError(null);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      const token = userInfo?.token;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/recommend`, {
        targetRole: role,
        skills: skillsArray.length > 0 ? skillsArray : null,
        experienceLevel: experience
      }, config);

      setJobs(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch job recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo?.token}`
        }
      };
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/resumes/upload`, formData, config);
      
      // Auto-fill skills from parsed resume
      if (data.extractedSkills && data.extractedSkills.length > 0) {
        setSkills(data.extractedSkills.join(', '));
        toast.success('Skills auto-filled from resume!');
      } else {
        toast.error('Could not extract skills from resume.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePractice = async (job) => {
    setPracticeLoading(job.company + job.title);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      
      // Generate the interview directly, passing job requirements
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/interviews/generate`, {
        interviewType: 'Company',
        role: job.title,
        experience: experience,
        targetCompany: job.company,
        companyDetails: {
          company: job.company,
          focus: 'Mixed',
          panelTone: 'Standard',
          jobRequirements: job.requirements
        }
      }, config);

      // Navigate instantly to session with the created interview
      navigate(`/interview/${data._id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start interview.');
      setPracticeLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-emerald-900/10 blur-[120px]"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-3xl mb-6"
          >
            <Briefcase className="w-12 h-12 text-emerald-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            AI Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Matchmaker</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Tell us what you're looking for, and our AI will find the perfect live job listings and let you instantly practice the exact interview for that role.
          </motion.p>
        </div>

        {/* Search Form & Resume Upload */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={fetchJobs}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 mb-12 max-w-4xl mx-auto shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Target Role <span className="text-emerald-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex justify-between items-center">
                <span>Your Skills (Comma separated)</span>
                <label className="cursor-pointer text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-2 py-1 rounded transition-colors flex items-center gap-1">
                  {uploadingResume ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  Auto-fill from Resume
                  <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploadingResume} />
                </label>
              </label>
              <input
                type="text"
                placeholder="React, Node.js, AWS"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead/Manager">Lead/Manager</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !role}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Finding Perfect Matches...</>
            ) : (
              <><Target className="w-5 h-5 mr-2" /> Find AI Job Matches</>
            )}
          </button>
          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        </motion.form>

        {/* Results Grid */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/30 rounded-3xl p-6 flex flex-col group transition-all duration-300 hover:bg-slate-900/60"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner">
                    <img 
                      src={getLogoUrl(job.company)} 
                      alt={job.company} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff`;
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      <Target className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold text-sm">{job.matchScore}% Match</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-1">{job.title}</h3>
                <p className="text-emerald-400 font-medium mb-4">{job.company}</p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center text-slate-400 text-sm bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-500" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-slate-400 text-sm bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                    <DollarSign className="w-4 h-4 mr-1.5 text-slate-500" />
                    {job.salary}
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 mb-6 flex-grow">
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{job.reasoning}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.requirements?.slice(0, 3).map((req, i) => (
                    <span key={i} className="text-xs font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      {req}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <a 
                    href={job.url || `https://www.google.com/search?q=careers+${encodeURIComponent(job.company)}+${encodeURIComponent(job.title)}`}
                    onClick={() => trackJobClick(job, userInfo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center border border-slate-700 hover:border-slate-500"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </a>
                  <button 
                    onClick={() => handlePractice(job)}
                    disabled={practiceLoading === job.company + job.title}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center group/btn shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
                  >
                    {practiceLoading === job.company + job.title ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" fill="currentColor" />
                        Practice
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
