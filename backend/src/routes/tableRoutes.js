import express from 'express';
import { TableController } from '../controllers/tableController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateTable } from '../middlewares/validation.js';

const router = express.Router();

// Routes publiques (pour voir les tables disponibles)
router.get('/', TableController.getAll);
router.get('/:id', TableController.getById);

// Routes protégées (ADMIN)
router.post('/', authMiddleware(['ADMIN']), validateTable, TableController.create);
router.put('/:id', authMiddleware(['ADMIN']), validateTable, TableController.update);
router.put('/:id/availability', authMiddleware(['ADMIN']), TableController.updateAvailability);
router.delete('/:id', authMiddleware(['ADMIN']), TableController.delete);

export default router;
