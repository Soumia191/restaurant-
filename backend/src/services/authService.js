import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

/**
 * Service d'authentification
 */
export class AuthService {
  /**
   * Génère un token JWT
   */
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Hash un mot de passe
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Vérifie un mot de passe
   */
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Connexion utilisateur
   */
  static async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // En mode démo, on accepte n'importe quel mot de passe
    // En production, décommenter la ligne suivante :
    // const isValid = await this.verifyPassword(password, user.password);
    // if (!isValid) throw new Error('Email ou mot de passe incorrect');

    const token = this.generateToken(user);
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
  }

  /**
   * Inscription client
   */
  static async register(email, password, name) {
    // Vérifier si l'utilisateur existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hash du mot de passe
    const hashedPassword = await this.hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'CLIENT',
        name: name || email.split('@')[0] // Utiliser le nom ou la partie avant @
      }
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
  }
}
