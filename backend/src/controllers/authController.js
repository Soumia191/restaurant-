import { AuthService } from '../services/authService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validateEmail, validateRequired } from '../middlewares/validation.js';

/**
 * Contrôleur d'authentification
 */
export class AuthController {
  /**
   * POST /api/auth/login
   * Connexion utilisateur
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    const missing = validateRequired(['email', 'password'], req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Champs manquants',
        missing
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Email invalide'
      });
    }

    const result = await AuthService.login(email, password);

    res.json({
      token: result.token,
      role: result.user.role,
      user: result.user
    });
  });

  /**
   * POST /api/auth/register
   * Inscription client
   */
  static register = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    // Validation
    const missing = validateRequired(['email', 'password'], req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Champs manquants',
        missing
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Email invalide'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      token: result.token,
      role: result.user.role,
      user: result.user
    });
  });
}
