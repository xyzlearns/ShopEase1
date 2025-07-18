import {
  Product,
  InsertProduct,
  CartItem,
  InsertCartItem,
  Order,
  InsertOrder,
  User,
  InsertUser,
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;

  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private users: Map<number, User>;
  private currentProductId: number;
  private currentCartId: number;
  private currentOrderId: number;
  private currentUserId: number;

  constructor() {
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.users = new Map();
    this.currentProductId = 1;
    this.currentCartId = 1;
    this.currentOrderId = 1;
    this.currentUserId = 1;

    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Memory Foam Mattress",
        price: 12999,
        category: "mattress",
        rating: 4.5,
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description:
          "Premium memory foam mattress with cooling gel technology and 10-year warranty.",
      },
      {
        name: "Orthopedic Pillow",
        price: 1899,
        category: "pillow",
        rating: 4.2,
        image:
          "https://images.unsplash.com/photo-1584434128309-6d96d6818202?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description:
          "Ergonomic orthopedic pillow designed for neck and spine support with breathable fabric.",
      },
      {
        name: "Luxury Spring Mattress",
        price: 18999,
        category: "mattress",
        rating: 4.7,
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description:
          "High-quality spring mattress with premium comfort layers and motion isolation.",
      },
      {
        name: "Wooden Bed Frame",
        price: 8999,
        category: "home",
        rating: 4.3,
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description:
          "Solid wood bed frame with modern design and sturdy construction.",
      },
      {
        name: "Bamboo Pillow Set",
        price: 2999,
        category: "pillow",
        rating: 4.6,
        image: "/images/bro.png",
        description:
          "Set of 2 bamboo fiber pillows with hypoallergenic and antimicrobial properties.",
      },
      {
        name: "Ceramic Table Lamp",
        price: 1599,
        category: "home",
        rating: 4.4,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description:
          "Beautiful ceramic table lamp with adjustable brightness and modern design.",
      },
      {
        name: "Coir Mattress",
        price: 7999,
        category: "mattress",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description:
          "Natural coir mattress with excellent ventilation and firm support.",
      },
      {
        name: "Silk Pillowcase Set",
        price: 1299,
        category: "pillow",
        rating: 4.5,
        image:
          "https://images.unsplash.com/photo-1584434128309-6d96d6818202?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        description:
          "Premium silk pillowcase set that's gentle on hair and skin.",
      },
    ];

    sampleProducts.forEach((product) => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id, rating: product.rating || 0 });
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (p) => p.category === category,
    );
  }

  async getCartItems(
    sessionId: string,
  ): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId,
    );
    const result = [];

    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        result.push({ ...item, product });
      }
    }

    return result;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (cartItem) =>
        cartItem.productId === item.productId &&
        cartItem.sessionId === item.sessionId,
    );

    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
      return existingItem;
    }

    const id = this.currentCartId++;
    const cartItem: CartItem = { ...item, id, quantity: item.quantity || 1 };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(
    id: number,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id, _]) => id);

    itemsToDelete.forEach((id) => this.cartItems.delete(id));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = {
      ...order,
      id,
      status: order.status || "pending",
      paymentScreenshotUrl: order.paymentScreenshotUrl || null,
      createdAt: new Date(),
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  // User methods
  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...userData,
      createdAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
}

export const storage = new MemStorage();
