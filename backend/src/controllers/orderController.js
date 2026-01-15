import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Contrôleur des commandes
 */
export class OrderController {
  /**
   * GET /api/orders
   * Récupère toutes les commandes
   * - ADMIN: toutes les commandes
   * - CLIENT: ses propres commandes
   * - LIVREUR: commandes disponibles et en cours
   */
  static getAll = asyncHandler(async (req, res) => {
    const { user } = req;
    const { status } = req.query;

    const where = {};
    
    // Filtrage par rôle
    if (user?.role === 'CLIENT') {
      where.userId = user.id;
    } else if (user?.role === 'LIVREUR') {
      // Livreur voit seulement les commandes ACCEPTED (acceptées par l'admin) et EN_COURS
      where.status = { in: ['ACCEPTED', 'EN_COURS'] };
    }

    // Filtre optionnel par statut
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            dish: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(orders);
  });

  /**
   * GET /api/orders/:id
   * Récupère une commande par ID
   */
  static getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            dish: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Vérifier les permissions
    if (user?.role === 'CLIENT' && order.userId !== user.id) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    res.json(order);
  });

  /**
   * POST /api/orders
   * Crée une nouvelle commande
   */
  static create = asyncHandler(async (req, res) => {
    const { items, userId, address, phone, notes } = req.body;
    const { user } = req;

    // Utiliser l'ID de l'utilisateur connecté si disponible
    const finalUserId = userId || user?.id || null;

    // Calculer le total
    const dishIds = items.map(item => item.dishId);
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds } }
    });

    let total = 0;
    for (const item of items) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish) {
        return res.status(400).json({ error: `Plat #${item.dishId} non trouvé` });
      }
      if (!dish.available) {
        return res.status(400).json({ error: `Le plat "${dish.name}" n'est plus disponible` });
      }
      total += dish.price * item.qty;
    }

    const orderData = {
      ...(finalUserId && { user: { connect: { id: finalUserId } } }),
      status: 'PENDING',
      total: parseFloat(total.toFixed(2)),
      items: {
        create: items.map(item => ({
          dishId: item.dishId,
          qty: item.qty
        }))
      }
    };

    // Ajouter les champs optionnels seulement s'ils sont fournis
    if (address) orderData.address = address;
    if (phone) orderData.phone = phone;
    if (notes) orderData.notes = notes;

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            dish: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(order);
  });

  /**
   * PUT /api/orders/:id/status
   * Met à jour le statut d'une commande (ADMIN, LIVREUR, CLIENT pour annulation)
   */
  static updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { user } = req;

    const validStatuses = ['PENDING', 'ACCEPTED', 'EN_COURS', 'LIVREE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide',
        validStatuses
      });
    }

    // Récupérer la commande actuelle
    const currentOrder = await prisma.order.findUnique({ 
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            dish: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!currentOrder) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Vérifier les permissions pour l'annulation par le client
    if (status === 'CANCELLED' && user?.role === 'CLIENT') {
      if (currentOrder.userId !== user.id) {
        return res.status(403).json({ error: 'Vous ne pouvez annuler que vos propres commandes' });
      }
      if (currentOrder.status !== 'PENDING') {
        return res.status(400).json({ 
          error: 'Vous ne pouvez annuler que les commandes en attente' 
        });
      }
    }

    // Restrictions pour les livreurs
    if (user?.role === 'LIVREUR') {
      // Livreur ne peut que passer de ACCEPTED à EN_COURS, ou EN_COURS à LIVREE
      if (currentOrder.status === 'ACCEPTED' && status !== 'EN_COURS') {
        return res.status(403).json({
          error: 'Vous ne pouvez que prendre en charge cette commande'
        });
      }
      if (currentOrder.status === 'EN_COURS' && status !== 'LIVREE') {
        return res.status(403).json({
          error: 'Vous ne pouvez que marquer cette commande comme livrée'
        });
      }
      // Livreur ne peut pas voir les commandes PENDING
      if (currentOrder.status === 'PENDING') {
        return res.status(403).json({
          error: 'Cette commande n\'a pas encore été acceptée par l\'administrateur'
        });
      }
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: {
            dish: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.json(order);
  });
}
