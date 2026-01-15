import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Contrôleur des plats
 */
export class DishController {
  /**
   * GET /api/dishes
   * Récupère tous les plats
   */
  static getAll = asyncHandler(async (req, res) => {
    const { categoryId, available } = req.query;
    
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (available !== undefined) where.available = available === 'true';

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(dishes);
  });

  /**
   * GET /api/dishes/:id
   * Récupère un plat par ID
   */
  static getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const dish = await prisma.dish.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true
      }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Plat non trouvé' });
    }

    res.json(dish);
  });

  /**
   * POST /api/dishes
   * Crée un nouveau plat (ADMIN)
   */
  static create = asyncHandler(async (req, res) => {
    const dish = await prisma.dish.create({
      data: req.body,
      include: {
        category: true
      }
    });

    res.status(201).json(dish);
  });

  /**
   * PUT /api/dishes/:id
   * Met à jour un plat (ADMIN)
   */
  static update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const dish = await prisma.dish.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
        category: true
      }
    });

    res.json(dish);
  });

  /**
   * DELETE /api/dishes/:id
   * Supprime un plat (ADMIN)
   */
  static delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    await prisma.dish.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Plat supprimé avec succès' });
  });
}
