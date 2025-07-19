import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import multer from "multer";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded payment screenshots
app.use('/uploads', express.static('public/uploads'));

// Set up routes
let routesRegistered = false;

export default async function handler(req: Request, res: Response) {
  if (!routesRegistered) {
    await registerRoutes(app);
    routesRegistered = true;
  }

  // Handle the request with Express
  return app(req, res);
}