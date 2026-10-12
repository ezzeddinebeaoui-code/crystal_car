import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbStore } from '../services/dbStore.ts';
import { generateToken, authenticate } from '../middleware/auth.ts';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { name, email, password, phone } = parse.data;
    const existing = await dbStore.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, error: 'Un compte existe déjà avec cette adresse email.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await dbStore.createUser({
      name,
      email,
      passwordHash,
      role: 'customer',
      phone: phone || '',
    });

    const token = generateToken(newUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await dbStore.addAuditLog({
      action: 'USER_REGISTERED',
      performedBy: name,
      performerEmail: email,
      performerRole: 'customer',
      entityType: 'auth',
      entityId: newUser._id,
      details: 'Nouveau compte client enregistré.',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        favorites: newUser.favorites || [],
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la création du compte.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.issues[0].message });
      return;
    }

    const { email, password } = parse.data;
    const user = await dbStore.findUserByEmail(email);

    if (!user) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, error: 'Votre compte a été suspendu. Veuillez contacter l’agence.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        favorites: user.favorites || [],
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Erreur de connexion.' });
  }
});

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

// Get current profile
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await dbStore.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        favorites: user.favorites || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
});

// Update profile
router.patch('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const updated = await dbStore.updateUser(req.user!.id, {
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Impossible de mettre à jour le profil.' });
  }
});

// Toggle Favorite Vehicle
router.post('/favorites/:vehicleId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId } = req.params;
    const user = await dbStore.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'Utilisateur non trouvé.' });
      return;
    }

    let favorites: string[] = user.favorites || [];
    if (favorites.includes(vehicleId)) {
      favorites = favorites.filter((id) => id !== vehicleId);
    } else {
      favorites.push(vehicleId);
    }

    await dbStore.updateUser(req.user!.id, { favorites });
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour des favoris.' });
  }
});

export default router;
