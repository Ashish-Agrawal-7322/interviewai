import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShieldAlert } from 'lucide-react';

const AdminInterviews = ({ token }) => {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInterviews = interviews.filter(int => 
    int.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    int.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Interview Management</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search candidate or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="p-4 text-sm font-semibold text-slate-300">Candidate</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Mode / Role</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Score</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Questions</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Warnings</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredInterviews.map(int => (
                <tr key={int._id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="text-white font-medium">{int.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-400">{int.user?.email || ''}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-300">{int.interviewType}</div>
                    <div className="text-xs text-indigo-400">{int.role}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    {int.status === 'Completed' ? (
                      <span className="font-bold text-emerald-400">{int.overallScore}%</span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="p-4 text-slate-300">
                    {int.questions?.length || 0} / {int.totalQuestions}
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(int.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {int.proctoringWarnings && Object.values(int.proctoringWarnings).some(v => v > 0) ? (
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/30 w-fit">
                          <ShieldAlert size={12} />
                          Tab: {int.proctoringWarnings.tabSwitch} | Face: {int.proctoringWarnings.faceMissing} | Mic: {int.proctoringWarnings.micOff} | Copy: {int.proctoringWarnings.copyPaste}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      int.status === 'Completed' || int.status === 'Evaluated' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      int.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {int.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredInterviews.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No interviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInterviews;
