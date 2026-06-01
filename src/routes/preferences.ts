import { Router } from "express";
import type { Request, Response } from "express";
import { db, preferences } from "../db/index.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.use(authMiddleware);

// GET /preferences
router.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const userPreferences = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, req.user.userId));

    res.json({
      preferences: userPreferences.map((p) => p.topic),
    });
  } catch (error) {
    console.error("Erro ao buscar preferências:", error);
    res.status(500).json({ error: "Erro ao buscar preferências" });
  }
});

// PUT /preferences
router.put("/", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { preferences: topics } = z
      .object({
        preferences: z.array(z.string().min(1)),
      })
      .parse(req.body);

    // Remover preferências antigas
    await db
      .delete(preferences)
      .where(eq(preferences.userId, req.user.userId));

    // Inserir novas preferências
    if (topics.length > 0) {
      await db.insert(preferences).values(
        topics.map((topic) => ({
          userId: req.user!.userId,
          topic,
        }))
      );
    }

    res.json({
      message: "Preferências atualizadas com sucesso",
      preferences: topics,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    console.error("Erro ao atualizar preferências:", error);
    res.status(500).json({ error: "Erro ao atualizar preferências" });
  }
});

export default router;
