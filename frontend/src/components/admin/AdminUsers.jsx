import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Ban, Trash2, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === id ? { ...u, status } : u));
      toast.success(`User status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleResetAttempts = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User attempts reset');
    } catch (err) {
      toast.error('Failed to reset attempts');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== id));
      toast.success('User permanently deleted');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
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
                <th className="p-4 text-sm font-semibold text-slate-300">Name</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Email</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Interviews</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Highest Score</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4 text-slate-300">{user.interviewsCount || 0}</td>
                  <td className="p-4 text-slate-300">{user.highestScore ? `${user.highestScore}%` : 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'Banned' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleResetAttempts(user._id)}
                        title="Reset Attempts"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                      >
                        <RotateCcw size={18} />
                      </button>
                      {user.status !== 'Banned' ? (
                        <button 
                          onClick={() => handleUpdateStatus(user._id, 'Banned')}
                          title="Ban User"
                          className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-400/10 rounded-md transition-colors"
                        >
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateStatus(user._id, 'Active')}
                          title="Unban User"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete User permanently"
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No users found
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

export default AdminUsers;
