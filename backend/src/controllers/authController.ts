import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

const generateToken = (user: { id: string, email: string }) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, branch, password } = (req as any).body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return (res as any).status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const joinedDate = new Date().toLocaleDateString();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        branch: branch || 'Computer Science',
        passwordHash,
        joinedDate,
        security: { twoFactorEnabled: false, lastLogin: new Date().toISOString() },
        achievements: [],
        bio: 'Engineering student ready to conquer.'
      }
    });

    (res as any).status(201).json({ user, verificationRequired: true });
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = (req as any).body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return (res as any).status(400).json({ error: 'Invalid credentials' });

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) return (res as any).status(400).json({ error: 'Invalid credentials' });

    // Update last login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        security: { ...(user.security as object), lastLogin: new Date().toISOString() } 
      }
    });

    const token = generateToken(updatedUser);
    (res as any).json({ user, updatedUser, token });
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = (req as any).body;
  if (code !== '1234') return (res as any).status(400).json({ error: 'Invalid code' });

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    });
    const token = generateToken(user);
    (res as any).json({ user, token });
  } catch (error) {
    (res as any).status(404).json({ error: 'User not found' });
  }
};

// POST /api/auth/social-login
export const socialLogin = async (req: Request, res: Response) => {
  try {
    const { provider, email, name, avatar } = (req as any).body;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          emailVerified: true,
          branch: 'Computer Science', // Default
          joinedDate: new Date().toLocaleDateString(),
          avatar,
          bio: `Joined via ${provider}`,
          security: { twoFactorEnabled: false, lastLogin: new Date().toISOString() },
          achievements: []
        }
      });
    } else {
        // Update last login
        user = await prisma.user.update({
            where: { id: user.id },
            data: { security: { ...(user.security as object), lastLogin: new Date().toISOString() } }
        });
    }

    const token = generateToken(user);
    (res as any).json({ user, token });
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ error: 'Social login failed' });
  }
};

// POST /api/auth/update
export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return (res as any).status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: (req as any).body
    });
    (res as any).json(user);
  } catch (error) {
    (res as any).status(500).json({ error: 'Update failed' });
  }
};