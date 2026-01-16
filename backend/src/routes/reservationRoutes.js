import express from 'express';
import { ReservationController } from '../controllers/reservationController.js';
import { authMiddleware, optionalAuth } from '../middlewares/auth.js';
import { validateReservation } from '../middlewares/validation.js';

const router = express.Router();

// Routes avec auth optionnelle
router.get('/', optionalAuth, ReservationController.getAll);
router.get('/:id', optionalAuth, ReservationController.getById);

// Routes protégées - création de réservation nécessite d'être authentifié
router.post('/', authMiddleware(), validateReservation, ReservationController.create);

// Routes protégées (ADMIN)
router.put('/:id/status', authMiddleware(['ADMIN']), ReservationController.updateStatus);

// Routes protégées (ADMIN ou propriétaire CLIENT)
router.delete('/:id', authMiddleware(), ReservationController.delete);

export default router;
