// Vercel API route for cart operations
import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  const sessionId = req.headers['x-session-id'] || 'default';

  if (req.method === 'GET') {
    try {
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const cartItem = await storage.addToCart({
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        sessionId
      });

      res.status(201).json(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}