import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import preferencesRoutes from "./routes/preferences.js";
import feedRoutes from "./routes/feed.js";

const app = express();
const PORT = process.env.PORT || 3000;

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "GROQ_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((env) => !process.env[env]);

if (missingEnvVars.length > 0) {
  console.error("❌ ERRO: Variáveis de ambiente faltando:");
  missingEnvVars.forEach((env) => console.error(`   - ${env}`));
  console.error("\n📝 Crie um arquivo .env com:");
  console.error("   DATABASE_URL=postgresql://...");
  console.error("   JWT_SECRET=sua-chave-secreta");
  console.error("   OPENAI_API_KEY=sk-...");
  process.exit(1);
}

if (process.env.JWT_SECRET!.length < 32) {
  console.warn("⚠️  AVISO: JWT_SECRET deve ter pelo menos 32 caracteres para segurança!");
}

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

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});