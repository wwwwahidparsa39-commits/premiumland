import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { requireAuth } from "./middleware/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Public Routes - Products (read-only)
  app.get(api.products.list.path, async (req, res) => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      
      const result = await storage.getProducts({ page, limit, search, categoryId });
      
      if (page && limit) {
        res.json({
          data: result.data,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        });
      } else {
        res.json(result.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Public Routes - Announcements (read-only)
  app.get(api.announcements.active.path, async (req, res) => {
    const announcements = await storage.getActiveAnnouncements();
    res.json(announcements);
  });

  // Public Routes - Categories (read-only)
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Public Routes - Orders (create only)
  app.post(api.orders.create.path, async (req, res) => {
    try {
      const { customerName, customerPhone, customerEmail, total, items } = req.body;
      
      const order = await storage.createOrder(
        { customerName, customerPhone, customerEmail, total, status: "pending" },
        items
      );
      
      res.status(201).json(order);
    } catch (err) {
      console.error("Error creating order:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  // Admin Protected Routes - Dashboard
  app.get(api.admin.dashboard.path, requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // Admin Protected Routes - Products
  app.post(api.products.create.path, requireAuth, async (req, res) => {
    try {
      console.log("Creating product with body:", req.body);
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      console.error("Product creation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          errors: err.errors
        });
      }
      res.status(500).json({ message: "Internal server error during product creation" });
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req, res) => {
    try {
      console.log(`Updating product ${req.params.id} with body:`, req.body);
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      console.error("Product update error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          errors: err.errors
        });
      }
      res.status(500).json({ message: "Internal server error during product update" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Admin Protected Routes - Announcements
  app.get(api.announcements.list.path, requireAuth, async (req, res) => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const search = req.query.search as string | undefined;
      
      const result = await storage.getAnnouncements({ page, limit, search });
      
      if (page && limit) {
        res.json({
          data: result.data,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        });
      } else {
        res.json(result.data);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      res.status(500).json({ message: "Error fetching announcements" });
    }
  });

  app.post(api.announcements.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.announcements.create.input.parse(req.body);
      const announcement = await storage.createAnnouncement(input);
      res.status(201).json(announcement);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.announcements.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.announcements.update.input.parse(req.body);
      const announcement = await storage.updateAnnouncement(Number(req.params.id), input);
      if (!announcement) return res.status(404).json({ message: "Announcement not found" });
      res.json(announcement);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.announcements.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteAnnouncement(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      res.status(500).json({ message: "Error deleting announcement" });
    }
  });

  // Admin Protected Routes - Categories
  app.post(api.categories.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.categories.create.input.parse(req.body);
      const category = await storage.createCategory(input);
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error creating category:", err);
      res.status(500).json({ message: "Error creating category" });
    }
  });

  app.patch(api.categories.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.categories.update.input.parse(req.body);
      const category = await storage.updateCategory(Number(req.params.id), input);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error updating category:", err);
      res.status(500).json({ message: "Error updating category" });
    }
  });

  app.delete(api.categories.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteCategory(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting category:", err);
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  // Admin Protected Routes - Orders
  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const status = req.query.status as string | undefined;
      
      const result = await storage.getOrders({ page, limit, status });
      
      res.json({
        data: result.data,
        pagination: page && limit ? {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        } : undefined,
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get(api.orders.get.path, requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrderById(Number(req.params.id));
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (err) {
      console.error("Error fetching order:", err);
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  app.patch(api.orders.updateStatus.path, requireAuth, async (req, res) => {
    try {
      const { status } = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(Number(req.params.id), status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error updating order status:", err);
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getProducts();
  if (existing.data.length === 0) {
    await storage.createProduct({
      title: "Premium VPN 1 Month",
      description: "High speed, unlimited bandwidth, supports 5 devices.",
      price: 150000,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000",
    });
    await storage.createProduct({
      title: "Spotify Premium",
      description: "Ad-free music listening, play offline, unlimited skips.",
      price: 90000,
      image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000",
    });
    await storage.createProduct({
      title: "Netflix 4K UHD",
      description: "Watch on 4 screens at once. Ultra HD available.",
      price: 250000,
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=1000",
    });
  }
}
