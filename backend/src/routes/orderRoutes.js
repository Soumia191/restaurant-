import express from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateOrder } from '../middlewares/validation.js';

const router = express.Router();

// Routes protégées - Les clients doivent être connectés pour voir leurs commandes
router.get('/', authMiddleware(['ADMIN', 'CLIENT', 'LIVREUR']), OrderController.getAll);
router.get('/:id', authMiddleware(['ADMIN', 'CLIENT', 'LIVREUR']), OrderController.getById);

// Créer une commande - Client doit être connecté
router.post('/', authMiddleware(['CLIENT']), validateOrder, OrderController.create);

// Mettre à jour le statut - Admin, Livreur, ou Client (pour annulation)
router.put('/:id/status', authMiddleware(['ADMIN', 'LIVREUR', 'CLIENT']), OrderController.updateStatus);

export default router;
