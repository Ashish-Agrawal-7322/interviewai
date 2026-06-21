import express from 'express';
import { executeCode } from '../controllers/codeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/execute').post(protect, executeCode);

export default router;
