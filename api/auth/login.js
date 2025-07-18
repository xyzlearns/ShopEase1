// Vercel API route for user login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../../server/storage.js';
import { loginSchema } from '../../shared/schema.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const { email, password } = validationResult.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        token 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Failed to login" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}