import Groq from "groq-sdk";
import type { NewsItem } from "./newsService.ts";

export interface FeedItem {
  title: string;
  source: string;
  url: string;
  summary: string;
}

export const generateSummaries = async (
  news: NewsItem[],
  interests: string[]
): Promise<FeedItem[]> => {
  if (news.length === 0) {
    return [];
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY not set in environment");
    }

    const groq = new Groq({ apiKey });

    const newsText = news
      .map(
        (item, idx) =>
          `${idx + 1}. Título: ${item.title}\nDescrição: ${item.description}\nFonte: ${item.source}\nURL: ${item.link}`
      )
      .join("\n\n");

    const prompt = `Você é um analista financeiro especializado. Analise as seguintes notícias financeiras e gere resumos concisos e relevantes para um investidor interessado em: ${interests.join(", ")}.

Para cada notícia relevante, forneça um resumo em uma frase concisa que capture o ponto principal.

Notícias:
${newsText}

Responda em JSON com o seguinte formato:
{
  "summaries": [
    {
      "index": 1,
      "summary": "Resumo conciso da notícia"
    }
  ]
}

Inclua apenas as notícias relevantes para os interesses mencionados. Se nenhuma notícia for relevante, retorne um array vazio.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de notícias financeiras. Responda sempre em JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    const feedItems: FeedItem[] = (parsed.summaries || [])
      .map((item: any) => {
        const newsItem = news[item.index - 1];
        if (!newsItem) return null;

        return {
          title: newsItem.title,
          source: newsItem.source,
          url: newsItem.link,
          summary: item.summary,
        };
      })
      .filter((item: any) => item !== null);

    return feedItems;
  } catch (error) {
    console.error("Erro ao gerar resumos com IA:", error);
    throw new Error("Não foi possível gerar resumos no momento");
  }
};