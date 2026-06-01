import Parser from "rss-parser";
import axios from "axios";

const parser = new Parser();

export interface NewsItem {
  title: string;
  link: string;
  description: string;
  source: string;
  pubDate: string;
}

// ============================================================================
// RSS FEEDS
// ============================================================================

/**
 * Busca notícias do InfoMoney via RSS
 */
export const fetchInfoMoneyNews = async (): Promise<NewsItem[]> => {
  try {
    const feed = await parser.parseURL("https://www.infomoney.com.br/feed/");

    const items: NewsItem[] = (feed.items || [])
      .slice(0, 50)
      .map((item) => ({
        title: item.title || "Sem título",
        link: item.link || "",
        description: item.contentSnippet || item.content || "",
        source: "InfoMoney",
        pubDate: item.pubDate || new Date().toISOString(),
      }));

    return items;
  } catch (error) {
    console.error("Erro ao buscar notícias do InfoMoney:", error);
    return [];
  }
};

export const fetchValorEconomicoNews = async (): Promise<NewsItem[]> => {
  const urls = [
    "https://valor.globo.com/rss/valor/",
    "https://valor.globo.com/rss/",
    "https://valorinternational.globo.com/rss/"
  ];

  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      const items: NewsItem[] = (feed.items || [])
        .slice(0, 50)
        .map((item) => ({
          title: item.title || "Sem título",
          link: item.link || "",
          description: item.contentSnippet || item.content || "",
          source: "Valor Econômico",
          pubDate: item.pubDate || new Date().toISOString(),
        }));
      
      if (items.length > 0) return items;
    } catch (error) {
      // Silenciosamente tenta a próxima URL
    }
  }

  console.warn("Não foi possível buscar notícias do Valor Econômico em nenhuma das URLs testadas.");
  return [];
};

// ============================================================================
// REST APIs
// ============================================================================

export const fetchNewsAPINews = async (keywords: string[] = []): Promise<NewsItem[]> => {
  try {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      console.warn("NEWSAPI_KEY não configurada no .env");
      return [];
    }

    // Se houver palavras-chave, usar a primeira para buscar
    const query = keywords.length > 0 ? keywords[0] : "economia Brasil";

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        language: "pt",
        sortBy: "publishedAt",
        pageSize: 50,
        apiKey: apiKey,
      },
    });

    if (response.data.status !== "ok") {
      console.error("Erro na resposta da NewsAPI:", response.data);
      return [];
    }

    const items: NewsItem[] = (response.data.articles || [])
      .slice(0, 50)
      .map((article: any) => ({
        title: article.title || "Sem título",
        link: article.url || "",
        description: article.description || article.content || "",
        source: "NewsAPI",
        pubDate: article.publishedAt || new Date().toISOString(),
      }));

    return items;
  } catch (error) {
    console.error("Erro ao buscar notícias da NewsAPI:", error);
    return [];
  }
};

export const fetchGNewsNews = async (keywords: string[] = []): Promise<NewsItem[]> => {
  try {
    const apiKey = process.env.GNEWS_KEY;
    if (!apiKey) {
      console.warn("GNEWS_KEY não configurada no .env");
      return [];
    }

    // Se houver palavras-chave, usar a primeira para buscar
    const query = keywords.length > 0 ? keywords[0] : "economia Brasil";

    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: query,
        lang: "pt",
        max: 50,
        sortby: "publishedAt",
        apikey: apiKey,
      },
    });

    if (response.data.totalArticles === undefined) {
      console.error("Erro na resposta da GNews:", response.data);
      return [];
    }

    const items: NewsItem[] = (response.data.articles || [])
      .slice(0, 50)
      .map((article: any) => ({
        title: article.title || "Sem título",
        link: article.url || "",
        description: article.description || "",
        source: "GNews",
        pubDate: article.publishedAt || new Date().toISOString(),
      }));

    return items;
  } catch (error) {
    console.error("Erro ao buscar notícias da GNews:", error);
    return [];
  }
};

// ============================================================================
// FUNÇÃO AGREGADORA
// ============================================================================
export const fetchAllNews = async (keywords: string[] = []): Promise<NewsItem[]> => {
  try {
    const [infoMoneyNews, valorNews, newsAPINews, gNewsNews] = await Promise.all([
      fetchInfoMoneyNews(),
      fetchValorEconomicoNews(),
      fetchNewsAPINews(keywords),
      fetchGNewsNews(keywords),
    ]);

    const allNews = [
      ...infoMoneyNews,
      ...valorNews,
      ...newsAPINews,
      ...gNewsNews,
    ];

    const uniqueNews = Array.from(
      new Map(
        allNews.map((item) => [
          item.title.toLowerCase().trim(),
          item,
        ])
      ).values()
    );

    // Ordenar por data (mais recentes primeiro)
    uniqueNews.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    return uniqueNews;
  } catch (error) {
    console.error("Erro ao buscar notícias consolidadas:", error);
    throw new Error("Não foi possível buscar notícias no momento");
  }
};

// ============================================================================
// FILTROS E PROCESSAMENTO
// ============================================================================

const tickerMap: Record<string, string[]> = {
  petr4: ["petrobras", "petróleo", "petr4", "pré-sal"],
  vale3: ["vale", "minério", "vale3"],
  itub4: ["itaú", "itub4", "banco itaú"],
  bbdc4: ["bradesco", "bbdc4"],
  mglu3: ["magazine luiza", "magalu", "mglu3"],
};

export const filterNewsByInterests = (
  news: NewsItem[],
  interests: string[]
): NewsItem[] => {
  if (interests.length === 0) {
    return news;
  }

  const lowerInterests = interests.map((i) => i.toLowerCase());

  const expandedInterests = lowerInterests.flatMap(
    (interest) => tickerMap[interest] || [interest]
  );

  return news.filter((item) => {
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();

    return expandedInterests.some(
      (interest) =>
        titleLower.includes(interest) || descLower.includes(interest)
    );
  });
};
