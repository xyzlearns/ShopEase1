import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertCartItemSchema, checkoutSchema } from "@shared/schema";
import { google } from "googleapis";

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Products API
  app.get("/api/products", async (req, res) => {
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
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart API
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string || 'default';
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string || 'default';
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string || 'default';
      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders API
  app.post("/api/orders", upload.single('paymentScreenshot'), async (req: MulterRequest, res: Response) => {
    try {
      const checkoutData = checkoutSchema.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string || 'default';
      
      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Validate payment screenshot is uploaded
      if (!req.file) {
        return res.status(400).json({ message: "Payment screenshot is required to complete the order" });
      }
      
      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type. Only JPEG, JPG and PNG images are allowed" });
      }
      
      // Validate file size (max 5MB)
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxFileSize) {
        return res.status(400).json({ message: "File size too large. Maximum 5MB allowed" });
      }
      
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;
      
      let paymentScreenshotUrl = null;
      
      // Upload payment screenshot to Google Drive if provided
      if (req.file) {
        try {
          const auth = new google.auth.GoogleAuth({
            credentials: {
              client_email: process.env.GOOGLE_CLIENT_EMAIL,
              private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
          });
          
          const drive = google.drive({ version: 'v3', auth });
          
          const fileMetadata = {
            name: `payment-screenshot-${Date.now()}.jpg`,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
          };
          
          const media = {
            mimeType: req.file.mimetype,
            body: req.file.buffer,
          };
          
          const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
          });
          
          // Make file publicly viewable
          await drive.permissions.create({
            fileId: file.data.id!,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
          
          paymentScreenshotUrl = `https://drive.google.com/file/d/${file.data.id}/view`;
        } catch (driveError) {
          console.error('Failed to upload to Google Drive:', driveError);
        }
      }
      
      // Create order with proper payment verification status
      const order = await storage.createOrder({
        customerName: `${checkoutData.firstName} ${checkoutData.lastName}`,
        customerEmail: checkoutData.email,
        customerAddress: checkoutData.address,
        customerCity: checkoutData.city,
        customerState: checkoutData.state,
        customerZip: checkoutData.zip,
        items: JSON.stringify(cartItems),
        subtotal,
        tax,
        total,
        paymentScreenshotUrl,
        status: 'payment_uploaded', // Changed from 'pending' to indicate screenshot was uploaded
      });
      
      // Save to Google Sheets if configured
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        
        if (spreadsheetId) {
          const values = [[
            order.id,
            order.customerName,
            order.customerEmail,
            order.customerAddress,
            order.customerCity,
            order.customerState,
            order.customerZip,
            order.subtotal,
            order.tax,
            order.total,
            order.status,
            order.paymentScreenshotUrl || '',
            order.createdAt?.toISOString() || new Date().toISOString(),
            cartItems.map(item => `${item.product.name} (x${item.quantity})`).join('; ')
          ]];
          
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Orders!A:N',
            valueInputOption: 'RAW',
            requestBody: { values },
          });
        }
      } catch (sheetsError) {
        console.error('Failed to save to Google Sheets:', sheetsError);
      }
      
      // Clear cart after successful order
      await storage.clearCart(sessionId);
      
      res.json(order);
    } catch (error) {
      console.error('Order creation failed:', error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
