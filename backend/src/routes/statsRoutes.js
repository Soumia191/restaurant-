import express from 'express';
import { StatsController } from '../controllers/statsController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Route protégée (ADMIN uniquement)
router.get('/', authMiddleware(['ADMIN']), StatsController.getStats);

export default router;
