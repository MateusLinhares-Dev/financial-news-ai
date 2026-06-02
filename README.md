# 📈 Financial News AI - Agregador de Notícias Financeiras com IA

Uma aplicação Full Stack que agrega notícias do mercado financeiro e usa IA para gerar resumos personalizados com base nos interesses de cada cliente.

## 🎯 Funcionalidades

- **Autenticação JWT**: Registro e login de usuários com senhas criptografadas
- **Gestão de Preferências**: Clientes cadastram seus interesses (ex: PETR4, setor bancário, taxa Selic)
- **Agregação de Notícias**: Busca automática de notícias via 4 fontes (InfoMoney, Valor Econômico, NewsAPI, GNews)
- **Resumos com IA**: Groq API gera resumos personalizados baseado nos interesses
- **Cache Inteligente**: Cache de 24 horas para evitar chamadas repetidas à IA
- **Feed Personalizado**: Exibição de notícias relevantes filtradas e resumidas

## 🏗️ Stack Tecnológico

### Backend
- **Node.js** + **TypeScript**
- **Express** para API REST
- **PostgreSQL** com Drizzle ORM
- **JWT** para autenticação
- **Groq API** para geração de resumos com IA
- **RSS Parser** para agregação de notícias
- **Axios** para chamadas HTTP

### Frontend
- **React** 19+ com TypeScript
- **Vite** para build rápido
- **Axios** para requisições HTTP
- **React Router** para navegação

## 📋 Endpoints da API

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login (retorna JWT)

### Preferências
- `GET /preferences` - Listar interesses do usuário
- `PUT /preferences` - Atualizar interesses

### Feed
- `GET /feed` - Retornar resumo personalizado do dia
- `POST /feed/refresh` - Forçar nova busca e resumo

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+ (ou Supabase)
- Conta Groq com API key (https://console.groq.com/keys)
- Opcional: NewsAPI key (https://newsapi.org) e GNews key (https://gnews.io)

### 1. Clonar o repositório
```bash
git clone <seu-repo>
cd financial-news-ai
```

### 2. Instalar dependências
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:
```env
# Banco de dados (use Supabase em produção)
DATABASE_URL=postgresql://user:password@localhost:5432/financial_news_ai

# Segurança
JWT_SECRET=sua-chave-secreta-aleatorio-de-32-caracteres-ou-mais

# IA (Groq - recomendado)
GROQ_API_KEY=gsk-seu-api-key-aqui

# Notícias (opcional)
NEWSAPI_KEY=sua-newsapi-key-aqui
GNEWS_KEY=sua-gnews-key-aqui

# Servidor
PORT=3000
NODE_ENV=development
```

### 4. Configurar banco de dados

```bash
# Gerar migrations
npm run db:generate

# Aplicar migrations
npm run db:push
```

### 5. Rodar o servidor
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### 6. Rodar o frontend

Em outro terminal:
```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📦 Estrutura do Projeto

```
financial-news-ai/
├── api/                    # Entrada para Vercel Serverless
│   └── index.ts           # Configuração do Express para Vercel
├── src/                    # Código do backend
│   ├── db/                # Configuração do banco de dados
│   │   ├── schema.ts      # Schema Drizzle
│   │   └── index.ts       # Conexão com DB
│   ├── middleware/        # Middlewares Express
│   │   └── auth.ts        # Autenticação JWT
│   ├── routes/            # Rotas da API
│   │   ├── auth.ts        # Rotas de autenticação
│   │   ├── preferences.ts # Rotas de preferências
│   │   └── feed.ts        # Rotas de feed
│   ├── services/          # Serviços de negócio
│   │   ├── newsService.ts # Busca de notícias (4 fontes)
│   │   └── aiService.ts   # Geração de resumos com Groq
│   ├── types/             # Tipos TypeScript
│   └── server.ts          # Servidor principal (local)
├── frontend/              # Aplicação React
│   ├── src/
│   │   ├── pages/         # Páginas (Login, Register, Feed, Preferences)
│   │   ├── services/      # Serviços de API
│   │   ├── styles/        # Estilos CSS
│   │   └── App.tsx        # App principal
│   └── package.json
├── vercel.json            # Configuração para Vercel
├── .env.example           # Exemplo de variáveis de ambiente
├── tsconfig.json          # Configuração TypeScript
└── package.json
```

## 🔐 Segurança

- Senhas são criptografadas com bcrypt
- JWT com expiração de 7 dias
- Variáveis sensíveis em `.env` (nunca commitadas)
- Validação de entrada com Zod
- CORS configurado
- Sem credenciais no repositório

## 🚢 Deploy no Vercel 

### Passo 1: Preparar o repositório Git
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/um-dr-lino/financial-news-ai
git push -u origin main
```

### Passo 2: Conectar ao Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em "Add New..." → "Project"
3. Importe seu repositório GitHub
4. O Vercel detectará automaticamente a configuração

### Passo 3: Configurar Variáveis de Ambiente
No painel do Vercel, adicione as seguintes variáveis (Environment Variables):

| Variável | Valor | Tipo |
|----------|-------|------|
| `DATABASE_URL` | URL do Supabase PostgreSQL | Secret |
| `JWT_SECRET` | Chave aleatória (32+ caracteres) | Secret |
| `GROQ_API_KEY` | Sua chave Groq | Secret |
| `NEWSAPI_KEY` | Sua chave NewsAPI (opcional) | Secret |
| `GNEWS_KEY` | Sua chave GNews (opcional) | Secret |

## 📝 Exemplo de Uso

### 1. Registrar usuário
```bash
curl -X POST https://seu-projeto.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### 2. Fazer login
```bash
curl -X POST https://seu-projeto.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### 3. Atualizar preferências
```bash
curl -X PUT https://seu-projeto.vercel.app/preferences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": ["PETR4", "setor bancário", "taxa Selic"]
  }'
```

### 4. Obter feed personalizado
```bash
curl -X GET https://seu-projeto.vercel.app/feed \
  -H "Authorization: Bearer <token>"
```

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se `DATABASE_URL` está correto
- Confirme que seu Supabase permite conexões externas
- Teste a conexão: `psql $DATABASE_URL`

### Erro ao gerar resumos
- Verifique se `GROQ_API_KEY` está configurada
- Confirme que sua conta Groq tem créditos
- Verifique se a chave é válida em https://console.groq.com

### Erro ao buscar notícias
- Verifique conexão de internet
- Confirme que as fontes RSS estão acessíveis
- Verifique os logs no Vercel

### CORS Issues
- Verifique se o frontend está acessando a URL correta da API
- Em produção, use `/api/...` (mesma origem)
- Em desenvolvimento, use `http://localhost:3000`

## 📚 Fontes de Notícias Integradas

1. **InfoMoney** (RSS) - https://www.infomoney.com.br/feed/
2. **Valor Econômico** (RSS) - https://valor.globo.com/rss/
3. **NewsAPI** (REST) - https://newsapi.org (plano free)
4. **GNews** (REST) - https://gnews.io (plano free)

## 📄 Licença

MIT

## 👤 Autor

Desenvolvido como desafio técnico para Manchester Investimentos

---

**Pronto para começar?** Clone o repositório e siga as instruções acima!

