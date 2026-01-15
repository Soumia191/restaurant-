import api, { setAuthToken } from './api';

/**
 * Service d'authentification
 */

/**
 * Connexion utilisateur
 */
export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  setAuthToken(data.token);
  return data; // { token, role, user }
}

/**
 * Inscription client
 */
export async function registerUser(email, password, name) {
  const { data } = await api.post('/auth/register', { email, password, name });
  setAuthToken(data.token);
  return data; // { token, role, user }
}

/**
 * Déconnexion
 */
export function logout() {
  setAuthToken(null);
}
