import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, X, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminResumes = ({ token }) => {
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResumes = resumes.filter(res => 
    res.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Resume Analyzer Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by candidate..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="p-4 text-sm font-semibold text-slate-300">Candidate</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Upload Date</th>
                <th className="p-4 text-sm font-semibold text-slate-300">ATS Score</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Skills Found</th>
                <th className="p-4 text-left font-medium text-slate-300">Feedback / Weaknesses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredResumes.map(res => (
                <tr key={res._id} onClick={() => setSelectedResume(res)} className="hover:bg-slate-700/50 cursor-pointer transition-colors">
                  <td className="p-4">
                    <div className="text-white font-medium">{res.user?.name || 'Unknown'}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(res.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-slate-300">
                    {res.atsScore ? (
                      <span className={`font-bold ${res.atsScore > 75 ? 'text-emerald-400' : res.atsScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {res.atsScore}%
                      </span>
                    ) : (
                      'Processing...'
                    )}
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {res.extractedSkills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {res.extractedSkills?.length > 3 && (
                        <span className="text-xs text-slate-500 py-0.5">+{res.extractedSkills.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="text-sm truncate max-w-xs text-slate-400" title={res.feedback}>
                      {res.feedback ? (res.feedback.length > 50 ? res.feedback.substring(0, 50) + '...' : res.feedback) : 'No feedback'}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResumes.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No resumes uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedResume && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-24 pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResume(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedResume.user?.name || 'Unknown Candidate'}</h3>
                    <p className="text-slate-400 text-sm">Uploaded on {new Date(selectedResume.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResume(null)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-emerald-400" size={18} />
                      <span className="font-semibold text-white">ATS Match Score</span>
                    </div>
                    <div className="text-4xl font-extrabold text-emerald-400">{selectedResume.atsScore || 0}%</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedResume.resumeUrl) {
                          const fullUrl = selectedResume.resumeUrl.startsWith('http') 
                            ? selectedResume.resumeUrl 
                            : `${import.meta.env.VITE_API_URL}${selectedResume.resumeUrl}`;
                          window.open(fullUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          alert('Original document URL is not available for this record.');
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                    >
                      <Eye size={18} /> View Original Document
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Extracted Skills ({selectedResume.extractedSkills?.length || 0})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.extractedSkills?.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    )) || <span className="text-slate-500">No skills extracted</span>}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    <AlertTriangle className="text-yellow-500" size={16} /> Detailed AI Feedback & Weaknesses
                  </h4>
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-5">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedResume.feedback || 'No feedback available.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminResumes;
