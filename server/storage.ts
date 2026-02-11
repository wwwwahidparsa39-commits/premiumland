import { 
  products, 
  announcements, 
  categories,
  orders,
  orderItems,
  type Product, 
  type InsertProduct, 
  type Announcement, 
  type InsertAnnouncement,
  type Category,
  type InsertCategory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(options?: { page?: number; limit?: number; search?: string; categoryId?: number }): Promise<{ data: Product[]; total: number }>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  
  // Announcements
  getAnnouncements(options?: { page?: number; limit?: number; search?: string }): Promise<{ data: Announcement[]; total: number }>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;
  
  // Orders
  getOrders(options?: { page?: number; limit?: number; status?: string }): Promise<{ data: Order[]; total: number }>;
  getOrderById(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    totalProducts: number;
    activeAnnouncements: number;
    totalOrders: number;
    revenueToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(options?: { page?: number; limit?: number; search?: string; categoryId?: number }): Promise<{ data: Product[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(products);
    let countQuery = db.select({ count: count() }).from(products);
    
    // Apply filters
    const conditions = [];
    if (options?.search) {
      conditions.push(sql`${products.title} ILIKE ${`%${options.search}%`}`);
    }
    if (options?.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }
    
    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereClause) as any;
      countQuery = countQuery.where(whereClause) as any;
    }
    
    const data = await query.orderBy(desc(products.createdAt)).limit(limit).offset(offset);
    const [{ count: total }] = await countQuery;
    
    return { data, total: Number(total) };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  // Announcements
  async getAnnouncements(options?: { page?: number; limit?: number; search?: string }): Promise<{ data: Announcement[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(announcements);
    let countQuery = db.select({ count: count() }).from(announcements);
    
    if (options?.search) {
      const whereClause = sql`${announcements.title} ILIKE ${`%${options.search}%`}`;
      query = query.where(whereClause) as any;
      countQuery = countQuery.where(whereClause) as any;
    }
    
    const data = await query.orderBy(announcements.order).limit(limit).offset(offset);
    const [{ count: total }] = await countQuery;
    
    return { data, total: Number(total) };
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(announcements.order);
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(insertAnnouncement)
      .returning();
    return announcement;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db
      .update(announcements)
      .set(announcement)
      .where(eq(announcements.id, id))
      .returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.order);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Orders
  async getOrders(options?: { page?: number; limit?: number; status?: string }): Promise<{ data: Order[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(orders);
    let countQuery = db.select({ count: count() }).from(orders);
    
    if (options?.status) {
      query = query.where(eq(orders.status, options.status)) as any;
      countQuery = countQuery.where(eq(orders.status, options.status)) as any;
    }
    
    const data = await query.orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
    const [{ count: total }] = await countQuery;
    
    return { data, total: Number(total) };
  }

  async getOrderById(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { order, items };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    
    if (items.length > 0) {
      await db.insert(orderItems).values(
        items.map(item => ({ ...item, orderId: order.id }))
      );
    }
    
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    totalProducts: number;
    activeAnnouncements: number;
    totalOrders: number;
    revenueToday: number;
  }> {
    const [{ count: totalProducts }] = await db.select({ count: count() }).from(products);
    
    const [{ count: activeAnnouncements }] = await db
      .select({ count: count() })
      .from(announcements)
      .where(eq(announcements.isActive, true));
    
    const [{ count: totalOrders }] = await db.select({ count: count() }).from(orders);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [{ total: revenueToday }] = await db
      .select({ total: sum(orders.total) })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${today}`);
    
    return {
      totalProducts: Number(totalProducts),
      activeAnnouncements: Number(activeAnnouncements),
      totalOrders: Number(totalOrders),
      revenueToday: Number(revenueToday || 0),
    };
  }
}

export const storage = new DatabaseStorage();
