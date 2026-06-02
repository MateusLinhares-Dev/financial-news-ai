import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "../src/routes/auth";
import preferencesRoutes from "../src/routes/preferences";
import feedRoutes from "../src/routes/feed";

// Lino coloquei essa lista de dominios permitidos para restringir os dominios que vão acessar tuas apis é uma boa prática essa execução para produção
const allowedOrigins = [
  'https://site.example.com',
]

const corsOptions = {
  origin: function (origin, callback) {
    // Permite solicitações sem origem, exemplo: postman, curl
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg  = 'A politica de CORS para este site não permite acesso a partir deste dominio.'
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200 // convenção para navegadores antigos
}

const app = express();

app.use(cors(corsOptions));
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
