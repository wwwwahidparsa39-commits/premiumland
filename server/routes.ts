import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // API Routes
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post(api.products.create.path, async (req, res) => {
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

  app.patch("/api/products/:id", async (req, res) => {
    try {
      console.log(`Updating product ${req.params.id} with body:`, req.body);
      const input = api.products.create.input.partial().parse(req.body);
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

  app.delete("/api/products/:id", async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // Announcements Routes
  app.get(api.announcements.list.path, async (req, res) => {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });

  app.get(api.announcements.active.path, async (req, res) => {
    const announcements = await storage.getActiveAnnouncements();
    res.json(announcements);
  });

  app.post(api.announcements.create.path, async (req, res) => {
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

  app.patch(api.announcements.update.path, async (req, res) => {
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

  app.delete(api.announcements.delete.path, async (req, res) => {
    await storage.deleteAnnouncement(Number(req.params.id));
    res.status(204).send();
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getProducts();
  if (existing.length === 0) {
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
