/**
 * Middleware de validation des données
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (fields, data) => {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field);
    }
  }
  return missing;
};

export const validateDish = (req, res, next) => {
  const { name, price, categoryId } = req.body;
  const missing = validateRequired(['name', 'price'], req.body);
  
  if (missing.length > 0) {
    return res.status(400).json({ 
      error: 'Champs manquants', 
      missing 
    });
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ 
      error: 'Le prix doit être un nombre positif' 
    });
  }
  
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ 
      error: 'Le nom doit contenir entre 2 et 100 caractères' 
    });
  }
  
  next();
};

export const validateReservation = (req, res, next) => {
  const { name, date, type } = req.body;
  const missing = validateRequired(['name', 'date', 'type'], req.body);
  
  if (missing.length > 0) {
    return res.status(400).json({ 
      error: 'Champs manquants', 
      missing 
    });
  }
  
  if (!['SUR_PLACE', 'LIVRAISON'].includes(type)) {
    return res.status(400).json({ 
      error: 'Type invalide. Doit être SUR_PLACE ou LIVRAISON' 
    });
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return res.status(400).json({ 
      error: 'Date invalide' 
    });
  }
  
  if (dateObj < new Date()) {
    return res.status(400).json({ 
      error: 'La date ne peut pas être dans le passé' 
    });
  }
  
  next();
};

export const validateOrder = (req, res, next) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      error: 'La commande doit contenir au moins un article' 
    });
  }
  
  for (const item of items) {
    if (!item.dishId || !item.qty) {
      return res.status(400).json({ 
        error: 'Chaque article doit avoir dishId et qty' 
      });
    }
    
    if (typeof item.qty !== 'number' || item.qty <= 0) {
      return res.status(400).json({ 
        error: 'La quantité doit être un nombre positif' 
      });
    }
  }
  
  next();
};

export const validateTable = (req, res, next) => {
  const { name, seats } = req.body;
  const missing = validateRequired(['name', 'seats'], req.body);
  
  if (missing.length > 0) {
    return res.status(400).json({ 
      error: 'Champs manquants', 
      missing 
    });
  }
  
  if (typeof seats !== 'number' || seats <= 0 || seats > 20) {
    return res.status(400).json({ 
      error: 'Le nombre de places doit être entre 1 et 20' 
    });
  }
  
  next();
};
