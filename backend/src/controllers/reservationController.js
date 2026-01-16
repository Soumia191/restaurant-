import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Contrôleur des réservations
 */
export class ReservationController {
  /**
   * GET /api/reservations
   * Récupère toutes les réservations (ADMIN) ou celles de l'utilisateur (CLIENT)
   */
  static getAll = asyncHandler(async (req, res) => {
    const { user } = req;
    const { status, type, date } = req.query;

    const where = {};
    
    // Les clients voient uniquement leurs propres réservations
    if (user?.role === 'CLIENT') {
      where.userId = user.id;
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = {
        gte: dateObj,
        lt: nextDay
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(reservations);
  });

  /**
   * GET /api/reservations/:id
   * Récupère une réservation par ID
   */
  static getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Vérifier les permissions pour les clients
    // Les clients peuvent voir uniquement leurs propres réservations
    if (user?.role === 'CLIENT' && reservation.userId !== user.id) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    res.json(reservation);
  });

  /**
   * POST /api/reservations
   * Crée une nouvelle réservation
   */
  static create = asyncHandler(async (req, res) => {
    const { name, date, type, tableId, guests } = req.body;
    const { user } = req;

    // Vérifier si la table est disponible (si réservation sur place)
    if (type === 'SUR_PLACE' && tableId) {
      const table = await prisma.table.findUnique({
        where: { id: parseInt(tableId) }
      });

      if (!table) {
        return res.status(404).json({ error: 'Table non trouvée' });
      }

      if (!table.available) {
        return res.status(400).json({ error: 'Cette table n\'est pas disponible' });
      }

      if (guests && guests > table.seats) {
        return res.status(400).json({ 
          error: `Cette table ne peut accueillir que ${table.seats} personnes` 
        });
      }

      // Vérifier s'il existe déjà une réservation confirmée ou en attente pour cette table cette jour-là
      const reservationDate = new Date(date);
      // Extraire année, mois, jour de la date reçue
      const resYear = reservationDate.getUTCFullYear();
      const resMonth = reservationDate.getUTCMonth();
      const resDay = reservationDate.getUTCDate();
      
      // Créer les limites du jour en UTC
      const startOfDay = new Date(Date.UTC(resYear, resMonth, resDay, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(resYear, resMonth, resDay + 1, 0, 0, 0, 0));

      const existingReservation = await prisma.reservation.findFirst({
        where: {
          tableId: parseInt(tableId),
          status: {
            in: ['CONFIRMED', 'PENDING']
          },
          date: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });

      if (existingReservation) {
        return res.status(400).json({ 
          error: 'Cette table a déjà une réservation pour cette journée' 
        });
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        name: name || (user ? user.name || user.email : 'Client'),
        date: new Date(date),
        type,
        tableId: type === 'SUR_PLACE' ? (tableId ? parseInt(tableId) : null) : null,
        userId: user?.id || null,
        guests: guests ? parseInt(guests) : null,
        status: 'PENDING'
      },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(reservation);
  });

  /**
   * PUT /api/reservations/:id/status
   * Met à jour le statut d'une réservation (ADMIN)
   */
  static updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide',
        validStatuses
      });
    }

    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        table: true
      }
    });

    res.json(reservation);
  });

  /**
   * DELETE /api/reservations/:id
   * Supprime une réservation (ADMIN ou propriétaire CLIENT)
   */
  static delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    
    // Vérifier que la réservation existe et appartient à l'utilisateur (pour les clients)
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Vérifier les permissions : ADMIN ou propriétaire CLIENT
    // Les clients peuvent supprimer uniquement leurs propres réservations
    if (user?.role === 'CLIENT' && reservation.userId !== user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres réservations' });
    }
    
    await prisma.reservation.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Réservation supprimée avec succès' });
  });
}
