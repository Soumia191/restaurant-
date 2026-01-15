import express from 'express';
import { DishController } from '../controllers/dishController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateDish } from '../middlewares/validation.js';

const router = express.Router();

// Routes publiques
router.get('/', DishController.getAll);
router.get('/:id', DishController.getById);

// Routes protégées (ADMIN)
router.post('/', authMiddleware(['ADMIN']), validateDish, DishController.create);
router.put('/:id', authMiddleware(['ADMIN']), validateDish, DishController.update);
router.delete('/:id', authMiddleware(['ADMIN']), DishController.delete);

export default router;
