import { useState, useEffect } from 'react';
import { feedService } from '../services/api';
import '../styles/Feed.css';

interface FeedItem {
  title: string;
  source: string;
  url: string;
  summary: string;
}

interface FeedData {
  generatedAt: string;
  interests: string[];
  items: FeedItem[];
}

export default function Feed() {
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await feedService.get();
      setFeed(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar feed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const response = await feedService.refresh();
      setFeed(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar feed');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="loading">Carregando seu feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-container">
        <div className="error-message">{error}</div>
        <button onClick={loadFeed} className="retry-btn">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Seu Feed Personalizado</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="refresh-btn"
        >
          {refreshing ? 'Atualizando...' : '🔄 Atualizar'}
        </button>
      </div>

      {feed && (
        <>
          <div className="feed-info">
            <p>
              Gerado em: {new Date(feed.generatedAt).toLocaleString('pt-BR')}
            </p>
            <p>
              Interesses: <strong>{feed.interests.join(', ')}</strong>
            </p>
          </div>

          {feed.items.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma notícia encontrada para seus interesses.</p>
              <p>Tente adicionar mais preferências ou atualizar o feed.</p>
            </div>
          ) : (
            <div className="feed-items">
              {feed.items.map((item, index) => (
                <div key={index} className="feed-card">
                  <h3>{item.title}</h3>
                  <p className="source">Fonte: {item.source}</p>
                  <p className="summary">{item.summary}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="read-more">
                    Ler artigo completo →
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
