import jwt from 'jsonwebtoken';

/**
 * Middleware d'authentification JWT
 * Vérifie le token et ajoute les informations utilisateur à la requête
 * @param {Array} roles - Rôles autorisés (optionnel, vide = tous les rôles)
 */
export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized - Token manquant' });
    }

    const token = auth.replace('Bearer ', '');
    
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérifier les permissions si des rôles sont spécifiés
      if (roles.length > 0 && !roles.includes(payload.role)) {
        return res.status(403).json({ 
          error: 'Forbidden - Permissions insuffisantes',
          required: roles,
          current: payload.role
        });
      }
      
      req.user = payload;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' });
      }
      return res.status(401).json({ error: 'Token invalide' });
    }
  };
};

/**
 * Middleware optionnel pour vérifier l'authentification sans restriction de rôle
 */
export const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (auth) {
    const token = auth.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
    } catch (error) {
      // Ignorer les erreurs pour l'auth optionnelle
    }
  }
  
  next();
};
