import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Contrôleur des catégories
 */
export class CategoryController {
  /**
   * GET /api/categories
   * Récupère toutes les catégories
   */
  static getAll = asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            dishes: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(categories);
  });

  /**
   * GET /api/categories/:id
   * Récupère une catégorie par ID
   */
  static getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        dishes: true,
        _count: {
          select: {
            dishes: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }

    res.json(category);
  });

  /**
   * POST /api/categories
   * Crée une nouvelle catégorie (ADMIN)
   */
  static create = asyncHandler(async (req, res) => {
    const { name, description, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || null
      }
    });

    res.status(201).json(category);
  });

  /**
   * PUT /api/categories/:id
   * Met à jour une catégorie (ADMIN)
   */
  static update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: req.body
    });

    res.json(category);
  });

  /**
   * DELETE /api/categories/:id
   * Supprime une catégorie (ADMIN)
   */
  static delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Vérifier s'il y a des plats dans cette catégorie
    const dishesCount = await prisma.dish.count({
      where: { categoryId: parseInt(id) }
    });

    if (dishesCount > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer cette catégorie car elle contient ${dishesCount} plat(s)`
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Catégorie supprimée avec succès' });
  });
}
