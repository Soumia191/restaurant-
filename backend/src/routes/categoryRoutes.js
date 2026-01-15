import express from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Routes protégées (ADMIN)
router.post('/', authMiddleware(['ADMIN']), CategoryController.create);
router.put('/:id', authMiddleware(['ADMIN']), CategoryController.update);
router.delete('/:id', authMiddleware(['ADMIN']), CategoryController.delete);

export default router;
