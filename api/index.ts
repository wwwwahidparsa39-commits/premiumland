import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, serial, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';

// Database Schema
const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

// Products CRUD
app.get('/api/products', async (_req, res) => {
  try {
    const result = await db.select().from(products).orderBy(desc(products.createdAt));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const [product] = await db.insert(products).values(req.body).returning();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(products).set(req.body).where(eq(products.id, id)).returning();
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/announcements/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(announcements).set(req.body).where(eq(announcements.id, id)).returning();
    if (!updated) return res.status(404).json({ error: 'Ad not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/announcements/active', async (_req, res) => {
  try {
    const result = await db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(announcements.order);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(announcements).where(eq(announcements.id, id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;