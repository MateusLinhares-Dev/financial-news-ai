import { Router } from "express";
import type { Request, Response } from "express";
import { db, preferences, feedCache } from "../db/index.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { eq } from "drizzle-orm";
import { fetchAllNews, filterNewsByInterests } from "../services/newsService.ts";
import { generateSummaries } from "../services/aiService.ts";

const router = Router();

router.use(authMiddleware);

interface FeedResponse {
  generatedAt: string;
  interests: string[];
  items: Array<{
    title: string;
    source: string;
    url: string;
    summary: string;
  }>;
}

const generateFeed = async (userId: number): Promise<FeedResponse> => {
  const userPreferences = await db
    .select()
    .from(preferences)
    .where(eq(preferences.userId, userId));

  const topics = userPreferences.map((p) => p.topic);

  const news = await fetchAllNews(topics);

  const filteredNews = filterNewsByInterests(news, topics);

  const summaries = await generateSummaries(filteredNews, topics);

  const feedData: FeedResponse = {
    generatedAt: new Date().toISOString(),
    interests: topics,
    items: summaries,
  };

  return feedData;
};

// GET /feed
router.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Verificar cache (válido por 24 horas)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const cached = await db
      .select()
      .from(feedCache)
      .where(eq(feedCache.userId, req.user.userId))
      .limit(1);

    if (
      cached.length > 0 &&
      new Date(cached[0].generatedAt) > oneDayAgo
    ) {
      return res.json(cached[0].contentJson);
    }

    const feedData = await generateFeed(req.user.userId);

    await db
      .delete(feedCache)
      .where(eq(feedCache.userId, req.user.userId));

    await db.insert(feedCache).values({
      userId: req.user.userId,
      contentJson: feedData,
      generatedAt: now,
    });

    res.json(feedData);
  } catch (error) {
    console.error("Erro ao gerar feed:", error);
    res.status(500).json({
      error: "Erro ao gerar feed",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    await db
      .delete(feedCache)
      .where(eq(feedCache.userId, req.user.userId));

    const feedData = await generateFeed(req.user.userId);

    await db.insert(feedCache).values({
      userId: req.user.userId,
      contentJson: feedData,
      generatedAt: new Date(),
    });

    res.json(feedData);
  } catch (error) {
    console.error("Erro ao atualizar feed:", error);
    res.status(500).json({
      error: "Erro ao atualizar feed",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export default router;
