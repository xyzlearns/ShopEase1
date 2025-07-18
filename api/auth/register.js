// Vercel API route for user registration
import bcrypt from 'bcryptjs';
import { storage } from '../../server/storage.js';
import { registerSchema } from '../../shared/schema.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const { email, password, firstName, lastName } = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Failed to create user" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}