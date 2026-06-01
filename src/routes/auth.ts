import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, users } from "../db/index.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning();

    const user = result[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.issues });
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const user = result[0];

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.issues });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

export default router;