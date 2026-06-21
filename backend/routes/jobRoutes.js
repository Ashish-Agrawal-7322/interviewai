import express from 'express';
import { getJobRecommendations, trackJobClick } from '../controllers/jobController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/recommend', protect, getJobRecommendations);
router.post('/click', protect, trackJobClick);

export default router;
