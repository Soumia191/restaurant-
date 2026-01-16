import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Contrôleur des statistiques (ADMIN)
 */
export class StatsController {
  /**
   * GET /api/stats
   * Récupère les statistiques du dashboard admin
   */
  static getStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    // Statistiques générales
    const [dishesCount, reservationsCount, ordersCount, tablesCount] = await Promise.all([
      prisma.dish.count(),
      prisma.reservation.count(),
      prisma.order.count({ where: dateFilter }),
      prisma.table.count()
    ]);

    // Tables disponibles
    const availableTables = await prisma.table.count({
      where: { available: true }
    });

    // Revenus (somme des commandes livrées)
    const completedOrders = await prisma.order.findMany({
      where: {
        ...dateFilter,
        status: 'LIVREE'
      },
      include: {
        items: {
          include: {
            dish: true
          }
        }
      }
    });

    let revenue = 0;
    for (const order of completedOrders) {
      // Utiliser le total si disponible, sinon calculer
      if (order.total) {
        revenue += order.total;
      } else {
        for (const item of order.items) {
          revenue += (item.dish?.price || 0) * item.qty;
        }
      }
    }

    // Commandes par statut
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: dateFilter
    });

    // Réservations par statut
    const reservationsByStatus = await prisma.reservation.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Commandes récentes (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      overview: {
        dishes: dishesCount,
        reservations: reservationsCount,
        orders: ordersCount,
        tables: {
          total: tablesCount,
          available: availableTables
        },
        revenue: parseFloat(revenue.toFixed(2)),
        recentOrders
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {}),
      reservationsByStatus: reservationsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {})
    });
  });
}
