import bcrypt from 'bcryptjs';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Configure Neon
neonConfig.webSocketConstructor = require('ws');

let db;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      if (!db) {
        return res.status(500).json({ message: "Database not configured" });
      }

      const { email, password, firstName, lastName } = req.body;

      // Basic validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [user] = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      }).returning();

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        message: "User created successfully",
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: "Failed to create user", 
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}