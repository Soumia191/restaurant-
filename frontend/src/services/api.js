import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// Fonction pour obtenir l'adresse IP du serveur Expo
const getExpoHost = () => {
  try {
    // Dans Expo Go, on peut utiliser le manifest pour obtenir l'adresse IP
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    if (debuggerHost) {
      return `http://${debuggerHost}:4000`;
    }
  } catch (e) {
    console.warn('Could not get Expo host:', e);
  }
  return null;
};

// Configuration de l'URL de base de l'API
const getBaseURL = () => {
  // 1. Vérifier si une URL personnalisée est définie dans les variables d'environnement
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Utiliser l'adresse IP du serveur Expo (pour appareil physique)
  const expoHost = getExpoHost();
  if (expoHost) {
    return expoHost;
  }

  // 3. Fallback selon la plateforme
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  
  if (Platform.OS === 'android') {
    // Pour émulateur Android
    return 'http://10.0.2.2:4000';
  }
  
  // Pour iOS simulator ou autres
  return 'http://localhost:4000';
};

const baseHost = getBaseURL();
console.log('🌐 API Base URL:', `${baseHost}/api`);

const api = axios.create({
  baseURL: `${baseHost}/api`,
  timeout: 10000, // 10 secondes de timeout
});

// Intercepteur pour les erreurs réseau
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
      console.error('❌ Erreur de connexion au backend');
      console.error('💡 Vérifiez que:');
      console.error('   1. Le backend est démarré (cd backend && npm run dev)');
      console.error('   2. Le backend écoute sur le port 4000');
      console.error(`   3. L\'URL de l\'API est correcte: ${baseHost}/api`);
      console.error('   4. Votre appareil et votre ordinateur sont sur le même réseau WiFi');
      console.error('   5. Le firewall n\' bloque pas le port 4000');
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default api;
