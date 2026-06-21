import express from 'express';
import {
  generateInterview,
  submitAnswer,
  completeInterview,
  getMyInterviews,
  getInterviewById,
  analyzeDaf,
  getLeaderboard
} from '../controllers/interviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getMyInterviews);
router.route('/generate').post(protect, generateInterview);
router.route('/daf-analyze').post(protect, analyzeDaf);
router.route('/leaderboard').get(getLeaderboard);
router.route('/:id').get(protect, getInterviewById);
router.route('/:id/answer').post(protect, submitAnswer);
router.route('/:id/complete').put(protect, completeInterview);

export default router;
