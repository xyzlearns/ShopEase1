// Vercel API route for products
import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { category } = req.query;
      let products;
      
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}