import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertCartItemSchema, checkoutSchema, loginSchema, registerSchema } from "@shared/schema";
import { hashPassword, comparePassword, generateToken, authenticateToken, type AuthRequest } from "./auth";
import { google } from "googleapis";
import { Readable } from "stream";

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication API
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Generate token
      const token = generateToken(user.id);
      
      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      res.json({ user: req.user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

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
  app.post("/api/orders", authenticateToken, upload.single('paymentScreenshot'), async (req: AuthRequest & MulterRequest, res: Response) => {
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
      
      // Save payment screenshot locally and provide access URL
      if (req.file) {
        try {
          console.log('💾 Saving payment screenshot locally...');
          console.log('File details:', {
            name: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          });
          
          // Save file locally in uploads directory
          const fs = await import('fs');
          const path = await import('path');
          
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('📁 Created uploads directory');
          }
          
          // Generate unique filename
          const timestamp = Date.now();
          const fileExtension = path.extname(req.file.originalname);
          const fileName = `payment-screenshot-${timestamp}${fileExtension}`;
          const filePath = path.join(uploadsDir, fileName);
          
          // Write file to disk
          fs.writeFileSync(filePath, req.file.buffer);
          
          // Create accessible URL
          paymentScreenshotUrl = `/uploads/${fileName}`;
          
          console.log('✅ Payment screenshot saved successfully');
          console.log('📄 File saved to:', filePath);
          console.log('🔗 Access URL:', paymentScreenshotUrl);
          
          // Try to also upload to Google Drive as backup (non-blocking)
          try {
            if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
              console.log('🔄 Attempting Google Drive backup upload...');
              
              const auth = new google.auth.GoogleAuth({
                credentials: {
                  client_email: process.env.GOOGLE_CLIENT_EMAIL,
                  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive.file'],
              });
              
              const drive = google.drive({ version: 'v3', auth });
              
              const fileMetadata = {
                name: fileName,
              };
              
              const media = {
                mimeType: req.file.mimetype,
                body: Readable.from(req.file.buffer),
              };
              
              const driveFile = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id,name,webViewLink',
              });
              
              console.log('✅ Backup uploaded to Google Drive:', driveFile.data.id);
            }
          } catch (driveError) {
            console.log('⚠️ Google Drive backup failed (non-critical):', driveError instanceof Error ? driveError.message : 'Unknown error');
          }
          
        } catch (saveError) {
          console.error('❌ Failed to save payment screenshot:', saveError);
          console.error('Save error details:', {
            message: saveError instanceof Error ? saveError.message : 'Unknown error',
            stack: saveError instanceof Error ? saveError.stack : undefined
          });
        }
      }
      
      // Create order with proper payment verification status
      const order = await storage.createOrder({
        userId: req.user!.id,
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
        console.log('🔄 Starting Google Sheets integration...');
        
        // Check if required environment variables are set
        if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
          throw new Error('Google Sheets credentials not configured. Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY.');
        }
        
        if (!process.env.GOOGLE_SHEET_ID) {
          throw new Error('Google Sheets ID not configured. Missing GOOGLE_SHEET_ID.');
        }
        
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        console.log('✅ Google Sheets Auth configured successfully');
        
        const sheets = google.sheets({ version: 'v4', auth });
        // Extract spreadsheet ID from URL if it's a full URL
        let spreadsheetId = process.env.GOOGLE_SHEET_ID;
        if (spreadsheetId?.includes('/spreadsheets/d/')) {
          const match = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
          if (match) {
            spreadsheetId = match[1];
            console.log('✅ Extracted spreadsheet ID:', spreadsheetId);
          }
        } else if (spreadsheetId?.includes('/edit')) {
          // Handle URLs like: 1r_lJ1xERb8aLOViEG9nauq0ZK2zRp1566F2LQBbplpk/edit?gid=0#gid=0
          const match = spreadsheetId.match(/^([a-zA-Z0-9-_]+)\/edit/);
          if (match) {
            spreadsheetId = match[1];
            console.log('✅ Extracted spreadsheet ID from edit URL:', spreadsheetId);
          }
        }
        
        console.log('📋 Using spreadsheet ID:', spreadsheetId);
        
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
        
        console.log('🔄 Appending order data to Google Sheets...', {
          spreadsheetId,
          range: 'Orders!A:N',
          rowData: values[0]
        });
        
        // First, try to get the spreadsheet to check if it exists and we have access
        try {
          await sheets.spreadsheets.get({ spreadsheetId });
          console.log('✅ Spreadsheet access confirmed');
        } catch (accessError) {
          console.error('❌ Cannot access spreadsheet:', accessError);
          throw new Error(`Cannot access Google Sheet. Please make sure the sheet ID is correct and the service account (${process.env.GOOGLE_CLIENT_EMAIL}) has been given editor access to the sheet.`);
        }
        
        // Try to append to Sheet1 first, if that fails, try to create Orders sheet
        let targetRange = 'Sheet1!A:N';
        try {
          const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: targetRange,
            valueInputOption: 'RAW',
            requestBody: { values },
          });
          console.log('✅ Successfully added to Sheet1');
        } catch (sheetError) {
          console.log('Sheet1 failed, trying to create Orders sheet...');
          try {
            // Create Orders sheet
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              requestBody: {
                requests: [{
                  addSheet: {
                    properties: {
                      title: 'Orders'
                    }
                  }
                }]
              }
            });
            console.log('✅ Created Orders sheet');
            
            // Add headers to the new sheet
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: 'Orders!A1:N1',
              valueInputOption: 'RAW',
              requestBody: {
                values: [['Order ID', 'Customer Name', 'Email', 'Address', 'City', 'State', 'ZIP', 'Subtotal', 'Tax', 'Total', 'Status', 'Payment Screenshot', 'Date', 'Items']]
              }
            });
            
            // Now append the order data
            await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: 'Orders!A:N',
              valueInputOption: 'RAW',
              requestBody: { values },
            });
            console.log('✅ Successfully added to Orders sheet');
          } catch (createError) {
            console.log('Creating Orders sheet failed, using default sheet...');
            // Fallback to just adding to the main sheet without range
            await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: 'A:N',
              valueInputOption: 'RAW',
              requestBody: { values },
            });
          }
        }
        
        console.log('✅ Google Sheets integration completed successfully');
      } catch (sheetsError) {
        console.error('❌ Failed to save to Google Sheets:', sheetsError);
        console.error('Sheets error details:', {
          message: sheetsError instanceof Error ? sheetsError.message : 'Unknown error',
          stack: sheetsError instanceof Error ? sheetsError.stack : undefined
        });
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
