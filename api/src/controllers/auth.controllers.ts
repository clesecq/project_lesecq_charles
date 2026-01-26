import { Request, Response } from 'express';
import db from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { validateUserCreation, validateLogin, validatePassword } from '../utils/validators.js';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '../middleware/auth.middleware.js';

const Utilisateur = db.utilisateurs;

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Validate input
    const validationErrors = validateUserCreation(req.body);
    if (validationErrors.length > 0) {
      res.status(400).send({
        message: 'Données invalides',
        errors: validationErrors
      });
      return;
    }

    // Check if user already exists
    const existingUser = await Utilisateur.findOne({ where: { login: req.body.login } });
    if (existingUser) {
      res.status(409).send({
        message: 'Un utilisateur avec ce login existe déjà'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.pass, 10);

    // Create user
    const utilisateur = {
      id: uuidv4(),
      nom: req.body.nom,
      prenom: req.body.prenom,
      login: req.body.login,
      pass: hashedPassword
    };

    const data = await Utilisateur.create(utilisateur);

    // Generate tokens
    const userPayload: JWTPayload = {
      id: data.id,
      login: data.login,
      nom: data.nom,
      prenom: data.prenom || ''
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.status(201).send({
      user: {
        id: data.id,
        login: data.login,
        nom: data.nom,
        prenom: data.prenom
      },
      accessToken,
      refreshToken
    });
  } catch (err: any) {
    res.status(500).send({
      message: err.message || 'Erreur lors de la création de l\'utilisateur'
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { pseudo, password } = req.body;

    // Validate credentials format
    const loginError = validateLogin(pseudo || '');
    const passwordError = validatePassword(password || '');

    if (loginError || passwordError) {
      res.status(400).send({
        message: 'Pseudo ou mot de passe incorrect',
        errors: [loginError, passwordError].filter(e => e !== null)
      });
      return;
    }

    // Find user by pseudo (login field)
    const user = await Utilisateur.findOne({ where: { login: pseudo } });

    if (!user) {
      res.status(401).send({
        message: 'Pseudo ou mot de passe incorrect'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.pass || '');

    if (!isPasswordValid) {
      res.status(401).send({
        message: 'Pseudo ou mot de passe incorrect'
      });
      return;
    }

    // Generate tokens
    const userPayload: JWTPayload = {
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom || ''
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.send({
      user: {
        id: user.id,
        login: user.login,
        nom: user.nom,
        prenom: user.prenom
      },
      accessToken,
      refreshToken
    });
  } catch (err: any) {
    res.status(500).send({
      message: err.message || 'Erreur lors de l\'authentification'
    });
  }
}

/**
 * Get current user from JWT token
 * GET /api/auth/me
 */
export function me(req: Request, res: Response): void {
  if (!req.user) {
    res.status(401).send({
      message: 'Non authentifié'
    });
    return;
  }

  res.send({
    user: req.user
  });
}
