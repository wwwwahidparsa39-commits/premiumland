import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Login
router.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find admin user
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: "نام کاربری یا رمز عبور اشتباه است" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "نام کاربری یا رمز عبور اشتباه است" });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      id: user.id,
      username: user.username,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "اطلاعات ورود نامعتبر است" });
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "خطا در ورود به سیستم" });
  }
});

// Logout
router.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "خطا در خروج از سیستم" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "با موفقیت خارج شدید" });
  });
});

// Get current user
router.get("/api/auth/me", (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json({
    id: req.session.userId,
    username: req.session.username,
  });
});

export default router;
