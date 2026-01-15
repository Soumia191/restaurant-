/**
 * Service de recherche d'images depuis Unsplash
 * Note: Pour la production, obtenez votre propre clé API sur https://unsplash.com/developers
 */

const UNSPLASH_ACCESS_KEY = 'YOUR_ACCESS_KEY'; // Remplacez par votre clé ou utilisez une clé demo
const UNSPLASH_API_URL = 'https://api.unsplash.com';

/**
 * Recherche d'images de plats depuis Unsplash
 * @param {string} query - Terme de recherche (ex: "pizza", "pasta", "burger")
 * @param {number} perPage - Nombre de résultats (max 30)
 * @returns {Promise<Array>} Liste d'images avec URLs
 */
export async function searchDishImages(query, perPage = 10) {
  try {
    // Si pas de clé API, utiliser des images placeholder basées sur le terme de recherche
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_ACCESS_KEY') {
      return getPlaceholderImages(query, perPage);
    }

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query + ' food dish')}&per_page=${perPage}&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error('Erreur API Unsplash');
    }

    const data = await response.json();
    
    return data.results.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      small: photo.urls.small,
      full: photo.urls.full,
      description: photo.description || photo.alt_description || query,
      author: photo.user.name,
    }));
  } catch (error) {
    console.warn('Erreur recherche images Unsplash:', error);
    // Fallback sur placeholder
    return getPlaceholderImages(query, perPage);
  }
}

/**
 * Génère des URLs d'images placeholder basées sur le terme de recherche
 * Utilise des services d'images libres comme placeholder.com et picsum.photos
 */
function getPlaceholderImages(query, count) {
  const foodKeywords = [
    'pizza', 'pasta', 'burger', 'salad', 'sushi', 'steak', 'chicken',
    'seafood', 'dessert', 'soup', 'breakfast', 'lunch', 'dinner'
  ];
  
  const keyword = query.toLowerCase().trim() || 'food';
  const images = [];
  
  for (let i = 0; i < count; i++) {
    // Utiliser Lorem Picsum avec des IDs variés pour des images différentes
    const imageId = Math.floor(Math.random() * 1000) + 300;
    images.push({
      id: `placeholder-${i}`,
      url: `https://picsum.photos/800/600?random=${imageId}&food=${encodeURIComponent(keyword)}`,
      thumbnail: `https://picsum.photos/400/300?random=${imageId}&food=${encodeURIComponent(keyword)}`,
      small: `https://picsum.photos/600/400?random=${imageId}&food=${encodeURIComponent(keyword)}`,
      full: `https://picsum.photos/1200/800?random=${imageId}&food=${encodeURIComponent(keyword)}`,
      description: `Image de ${keyword}`,
      author: 'Placeholder',
    });
  }
  
  return images;
}

/**
 * Recherche des images de plats populaires
 * Retourne des images pré-définies de plats communs
 */
export function getPopularDishImages() {
  const popularDishes = [
    { name: 'Pizza', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800' },
    { name: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800' },
    { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800' },
    { name: 'Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
    { name: 'Sushi', url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800' },
    { name: 'Steak', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800' },
    { name: 'Chicken', url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800' },
    { name: 'Dessert', url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800' },
  ];

  return popularDishes.map((dish, index) => ({
    id: `popular-${index}`,
    url: dish.url,
    thumbnail: dish.url,
    small: dish.url,
    full: dish.url,
    description: dish.name,
    author: 'Unsplash',
  }));
}

/**
 * Génère une URL d'image placeholder pour un nom de plat
 */
export function getDishPlaceholderImage(dishName) {
  const encodedName = encodeURIComponent(dishName);
  return `https://via.placeholder.com/800x600/6270ff/ffffff?text=${encodedName}`;
}
