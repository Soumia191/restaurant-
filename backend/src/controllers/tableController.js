import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Contrôleur des tables
 */
export class TableController {
  /**
   * GET /api/tables
   * Récupère toutes les tables avec leur disponibilité basée sur les réservations du jour
   */
  static getAll = asyncHandler(async (req, res) => {
    const { available, date } = req.query;

    // Obtenir le début et la fin de la journée
    let startOfDay, endOfDay;
    
    if (date) {
      // Si une date est fournie (format YYYY-MM-DD HH:MM:SS ISO), extraire la date en UTC
      const reservationDate = new Date(date);
      const year = reservationDate.getUTCFullYear();
      const month = reservationDate.getUTCMonth();
      const day = reservationDate.getUTCDate();
      
      startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      endOfDay = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));
    } else {
      // Utiliser aujourd'hui en UTC
      const today = new Date();
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const day = today.getUTCDate();
      
      startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      endOfDay = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));
    }

    const where = {};
    if (available !== undefined) {
      where.available = available === 'true';
    }

    const tables = await prisma.table.findMany({
      where,
      include: {
        reservations: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING']
            },
            date: {
              gte: startOfDay,
              lt: endOfDay
            }
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Marquer les tables comme indisponibles si elles ont une réservation pour cette date
    const tablesWithAvailability = tables.map(table => ({
      ...table,
      availableToday: table.available && table.reservations.length === 0,
      hasReservationToday: table.reservations.length > 0
    }));

    res.json(tablesWithAvailability);
  });

  /**
   * GET /api/tables/:id
   * Récupère une table par ID
   */
  static getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) },
      include: {
        reservations: {
          where: {
            status: 'CONFIRMED'
          },
          orderBy: {
            date: 'asc'
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({ error: 'Table non trouvée' });
    }

    res.json(table);
  });

  /**
   * POST /api/tables
   * Crée une nouvelle table (ADMIN)
   */
  static create = asyncHandler(async (req, res) => {
    const table = await prisma.table.create({
      data: req.body
    });

    res.status(201).json(table);
  });

  /**
   * PUT /api/tables/:id
   * Met à jour une table (ADMIN)
   */
  static update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const table = await prisma.table.update({
      where: { id: parseInt(id) },
      data: req.body
    });

    res.json(table);
  });

  /**
   * PUT /api/tables/:id/availability
   * Met à jour la disponibilité d'une table (ADMIN)
   */
  static updateAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { available } = req.body;

    const table = await prisma.table.update({
      where: { id: parseInt(id) },
      data: { available }
    });

    res.json(table);
  });

  /**
   * DELETE /api/tables/:id
   * Supprime une table (ADMIN)
   */
  static delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Vérifier s'il y a des réservations actives
    const reservations = await prisma.reservation.count({
      where: {
        tableId: parseInt(id),
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (reservations > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer cette table car elle a des réservations actives'
      });
    }

    await prisma.table.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Table supprimée avec succès' });
  });
}
