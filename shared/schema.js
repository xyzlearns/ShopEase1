// ES Module version of schema for Vercel functions
import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(),
  rating: real("rating").notNull().default(0),
  image: text("image").notNull(),
  description: text("description").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  sessionId: text("session_id").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerCity: text("customer_city").notNull(),
  customerState: text("customer_state").notNull(),
  customerZip: text("customer_zip").notNull(),
  items: text("items").notNull(),
  subtotal: real("subtotal").notNull(),
  tax: real("tax").notNull(),
  total: real("total").notNull(),
  paymentScreenshotUrl: text("payment_screenshot_url"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});