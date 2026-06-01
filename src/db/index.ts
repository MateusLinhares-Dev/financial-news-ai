import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL não está definida! Adicione ao arquivo .env:\n" +
    "   DATABASE_URL=postgresql://postgres:password@host:5432/database"
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configurações para melhor compatibilidade com Supabase
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  // Timeout de conexão
  connectionTimeoutMillis: 5000,
  // Timeout de query
  query_timeout: 30000,
});

pool.on("error", (err) => {
  console.error("❌ Erro no pool de conexão:", err);
});

pool.on("connect", () => {
  console.log("✅ Conectado ao banco de dados");
});

export const db = drizzle(pool, { schema });

export * from "./schema.ts";
