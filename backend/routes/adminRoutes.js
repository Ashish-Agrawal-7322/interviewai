import express from 'express';
import { 
  getUsers, 
  getPlatformStats, 
  updateUserStatus, 
  resetUserInterviews,
  deleteUser,
  getAllInterviews,
  getAllResumes,
  getAdminSettings,
  updateAdminSettings,
  getAnalyticsData
} from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id/status').put(protect, admin, updateUserStatus);
router.route('/users/:id/interviews').delete(protect, admin, resetUserInterviews);
router.route('/users/:id').delete(protect, admin, deleteUser);

router.route('/interviews').get(protect, admin, getAllInterviews);
router.route('/resumes').get(protect, admin, getAllResumes);

router.route('/settings')
  .get(protect, admin, getAdminSettings)
  .put(protect, admin, updateAdminSettings);

router.route('/stats').get(protect, admin, getPlatformStats);
router.route('/analytics').get(protect, admin, getAnalyticsData);

export default router;
