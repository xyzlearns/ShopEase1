import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { products } from '../shared/schema.js';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      if (!db) {
        return res.status(500).json({ message: "Database not configured" });
      }

      const { category } = req.query;
      let result;
      
      if (category && typeof category === 'string') {
        result = await db.select().from(products).where(eq(products.category, category));
      } else {
        result = await db.select().from(products);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}