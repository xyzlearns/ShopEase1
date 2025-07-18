import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  try {
    const user = await storage.getUserById(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
}