import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = ({ token }) => {
  const [settings, setSettings] = useState({
    maxInterviewDuration: 60,
    enableFollowUpQuestions: true,
    aiDifficulty: 'Medium',
    enableVoiceAnalysis: true,
    evaluationCriteria: {
      confidenceAnalysis: true,
      eyeContactAnalysis: true,
      technicalAccuracy: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data) {
        setSettings(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load AI settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('AI Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const handleCheckboxChange = (field, subfield = null) => {
    if (subfield) {
      setSettings({
        ...settings,
        [field]: {
          ...settings[field],
          [subfield]: !settings[field][subfield]
        }
      });
    } else {
      setSettings({
        ...settings,
        [field]: !settings[field]
      });
    }
  };

  if (loading) return <div className="text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <Settings className="text-indigo-400" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Configuration</h2>
          <p className="text-slate-400">Manage how the AI interviewer behaves across the platform.</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 space-y-8">
        
        {/* Core Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Core Interview Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Max Interview Duration (minutes)</label>
              <input 
                type="number" 
                value={settings.maxInterviewDuration}
                onChange={(e) => setSettings({...settings, maxInterviewDuration: Number(e.target.value)})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">AI Difficulty Level</label>
              <select 
                value={settings.aiDifficulty}
                onChange={(e) => setSettings({...settings, aiDifficulty: e.target.value})}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Easy">Easy (Forgiving)</option>
                <option value="Medium">Medium (Standard)</option>
                <option value="Hard">Hard (Strict)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <div>
              <p className="font-medium text-white">Enable Follow-Up Questions</p>
              <p className="text-sm text-slate-400">Allow AI to ask dynamic follow-ups based on candidate's answers.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.enableFollowUpQuestions} onChange={() => handleCheckboxChange('enableFollowUpQuestions')} />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <div>
              <p className="font-medium text-white">Enable Voice/Speech Analysis</p>
              <p className="text-sm text-slate-400">Allow AI to process and evaluate spoken audio during the interview.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.enableVoiceAnalysis} onChange={() => handleCheckboxChange('enableVoiceAnalysis')} />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Evaluation Criteria</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-700/50">
              <input type="checkbox" checked={settings.evaluationCriteria.confidenceAnalysis} onChange={() => handleCheckboxChange('evaluationCriteria', 'confidenceAnalysis')} className="w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-700 border-slate-600" />
              <span className="text-slate-300">Confidence Analysis</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-700/50">
              <input type="checkbox" checked={settings.evaluationCriteria.eyeContactAnalysis} onChange={() => handleCheckboxChange('evaluationCriteria', 'eyeContactAnalysis')} className="w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-700 border-slate-600" />
              <span className="text-slate-300">Eye Contact Tracking</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-700/50">
              <input type="checkbox" checked={settings.evaluationCriteria.technicalAccuracy} onChange={() => handleCheckboxChange('evaluationCriteria', 'technicalAccuracy')} className="w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-700 border-slate-600" />
              <span className="text-slate-300">Technical Accuracy</span>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
