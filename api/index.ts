import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "../src/routes/auth";
import preferencesRoutes from "../src/routes/preferences";
import feedRoutes from "../src/routes/feed";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/feed", feedRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erro:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

export default app;