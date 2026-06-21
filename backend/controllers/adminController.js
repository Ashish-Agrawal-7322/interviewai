import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
import AdminSettings from '../models/AdminSettings.js';
import ApiUsage from '../models/ApiUsage.js';
import JobClick from '../models/JobClick.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  // Sort by newest first
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  
  // Aggregate highest scores for each user
  const usersWithScores = await Promise.all(users.map(async (user) => {
    const interviews = await Interview.find({ user: user._id });
    const highestScore = interviews.reduce((max, int) => Math.max(max, int.overallScore || 0), 0);
    return {
      ...user._doc,
      interviewsCount: interviews.length,
      highestScore
    };
  }));

  res.json(usersWithScores);
});

// @desc    Update user status (Ban / Soft Delete)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.status = req.body.status || user.status;
    const updatedUser = await user.save();
    res.json({ message: 'User status updated', user: { id: updatedUser._id, status: updatedUser.status } });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Reset user interview attempts (example implementation, assuming a field exists or just deleting failed interviews)
// @route   DELETE /api/admin/users/:id/interviews
// @access  Private/Admin
const resetUserInterviews = asyncHandler(async (req, res) => {
  // For now, this just deletes all incomplete interviews for the user
  await Interview.deleteMany({ user: req.params.id, status: { $ne: 'Completed' } });
  res.json({ message: 'User interview attempts reset successfully' });
});

// @desc    Delete user completely
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.deleteOne({ _id: user._id });
    await Interview.deleteMany({ user: user._id });
    await Resume.deleteMany({ user: user._id });
    res.json({ message: 'User removed completely' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all interviews
// @route   GET /api/admin/interviews
// @access  Private/Admin
const getAllInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(interviews);
});

// @desc    Get all resumes
// @route   GET /api/admin/resumes
// @access  Private/Admin
const getAllResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(resumes);
});

// @desc    Get Admin Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getAdminSettings = asyncHandler(async (req, res) => {
  let settings = await AdminSettings.findOne({});
  if (!settings) {
    settings = await AdminSettings.create({}); // create defaults if none exist
  }
  res.json(settings);
});

// @desc    Update Admin Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateAdminSettings = asyncHandler(async (req, res) => {
  let settings = await AdminSettings.findOne({});
  if (!settings) {
    settings = await AdminSettings.create({});
  }

  settings.maxInterviewDuration = req.body.maxInterviewDuration ?? settings.maxInterviewDuration;
  settings.enableFollowUpQuestions = req.body.enableFollowUpQuestions ?? settings.enableFollowUpQuestions;
  settings.aiDifficulty = req.body.aiDifficulty || settings.aiDifficulty;
  settings.enableVoiceAnalysis = req.body.enableVoiceAnalysis ?? settings.enableVoiceAnalysis;
  
  if (req.body.evaluationCriteria) {
    settings.evaluationCriteria = { ...settings.evaluationCriteria, ...req.body.evaluationCriteria };
  }

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({});
  
  // Active users today (created today or last login today - assuming createdAt for now or just generic logic)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeUsersToday = await User.countDocuments({ createdAt: { $gte: today } }); // Replace with actual login tracking if needed
  
  // New users this week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });

  const totalInterviews = await Interview.countDocuments({});
  const totalResumes = await Resume.countDocuments({});
  const completedInterviews = await Interview.countDocuments({ status: 'Completed' });

  // Calculate Average Score
  const completedInterviewsData = await Interview.find({ status: 'Completed' });
  let totalScore = 0;
  completedInterviewsData.forEach(int => {
    totalScore += (int.overallScore || 0);
  });
  const avgScore = completedInterviewsData.length > 0 ? Math.round(totalScore / completedInterviewsData.length) : 0;

  // For API limits, we approximate existing usage based on database objects to seed the first run,
  // but moving forward it would use the ApiUsage model.
  const todayStr = today.toISOString().split('T')[0];
  const monthStr = today.toISOString().slice(0, 7);
  
  let geminiUsage = await ApiUsage.findOne({ provider: 'Gemini', date: todayStr });
  let groqUsage = await ApiUsage.findOne({ provider: 'Groq', date: todayStr });
  let jsearchUsage = await ApiUsage.findOne({ provider: 'JSearch', date: monthStr });
  let resendUsage = await ApiUsage.findOne({ provider: 'Resend', date: monthStr });

  // Calculate real jobs applied/clicked from the database
  const jobsApplied = await JobClick.countDocuments({});

  // Accurately approximate based on actual database records
  const geminiCount = geminiUsage?.count || (completedInterviews * 4); 
  const groqCount = groqUsage?.count || (completedInterviews * 2);
  const jsearchCount = jsearchUsage?.count || 0;
  const resendCount = resendUsage?.count || totalUsers;

  const apiLimits = {
    gemini: { used: geminiCount, limit: 1500, label: 'Gemini (Daily)' },
    groq: { used: groqCount, limit: 14400, label: 'Groq (Daily)' },
    jsearch: { used: jsearchCount, limit: 50, label: 'JSearch (Monthly)' },
    resend: { used: resendCount, limit: 3000, label: 'Resend (Monthly)' }
  };


  // Top Candidates (Leaderboard)
  const allInterviews = await Interview.find({ status: 'Completed' }).populate('user', 'name');
  const userHighestScores = {};
  allInterviews.forEach(int => {
    if (int.user && int.user._id) {
      const userId = int.user._id.toString();
      const score = int.overallScore || 0;
      if (!userHighestScores[userId] || score > userHighestScores[userId].score) {
        userHighestScores[userId] = {
          name: int.user.name,
          score: score,
          role: int.role,
          experience: int.experience,
          feedback: int.overallFeedback,
          date: int.createdAt,
          interviewType: int.interviewType
        };
      }
    }
  });
  const topCandidates = Object.values(userHighestScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Top 3

  res.json({
    totalUsers,
    activeUsersToday,
    newUsersThisWeek,
    totalInterviews,
    totalResumes,
    completedInterviews,
    avgScore,
    apiLimits,
    jobsApplied,
    topCandidates
  });
});

// @desc    Get Analytics Data for Graphs
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalyticsData = asyncHandler(async (req, res) => {
  // Fetch real data for Popular Modes
  const modesAggregation = await Interview.aggregate([
    { $group: { _id: '$interviewType', count: { $sum: 1 } } }
  ]);

  let popularModes = modesAggregation.map(mode => ({
    name: mode._id || 'Standard',
    value: mode.count
  }));

  // If no data exists, provide a flatline baseline
  if (popularModes.length === 0) {
    popularModes = [{ name: 'No Data Yet', value: 1 }];
  }

  // Fetch real data for Daily Interviews (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyAggregation = await Interview.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        count: { $sum: 1 }
      }
    }
  ]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyInterviews = daysOfWeek.map((day, index) => {
    // $dayOfWeek returns 1 for Sunday, 2 for Monday, etc.
    const found = dailyAggregation.find(d => d._id === index + 1);
    return { date: day, count: found ? found.count : 0 };
  });

  // Calculate Job Search Engagement
  const jobsClicked = await JobClick.countDocuments({});
  const monthStr = new Date().toISOString().slice(0, 7);
  const jsearchUsage = await ApiUsage.findOne({ provider: 'JSearch', date: monthStr });
  const jobsFetched = jsearchUsage?.count || 12; // Use actual count or fallback proxy

  const jobSearchStats = [
    { name: 'Jobs Fetched (via AI)', value: jobsFetched, fill: '#3b82f6' },
    { name: 'Jobs Clicked', value: jobsClicked, fill: '#10b981' }
  ];

  res.json({
    popularModes,
    dailyInterviews,
    jobSearchStats
  });
});

export { 
  getUsers, 
  updateUserStatus,
  resetUserInterviews,
  deleteUser,
  getPlatformStats, 
  getAllInterviews, 
  getAllResumes, 
  getAdminSettings, 
  updateAdminSettings,
  getAnalyticsData
};
