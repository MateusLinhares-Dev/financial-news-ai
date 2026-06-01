import { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { feedService } from '../services/api';
import '../styles/Feed.css';

interface FeedItem {
  title: string;
  source: string;
  url: string;
  summary: string;
  interest?: string;
  readingTime?: number;
  publishedAt?: string;
}

interface FeedData {
  generatedAt: string;
  interests: string[];
  items: FeedItem[];
}

const COLORS = ['#378ADD', '#5DCAA5', '#EF9F27', '#D4537E', '#7F77DD', '#D85A30'];
const BADGES = [
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#FAECE7', color: '#993C1D' },
];

function estimateReadingTime(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

function buildHourlyData(items: FeedItem[]): number[] {
  const counts = Array(12).fill(0);
  items.forEach((item) => {
    if (item.publishedAt) {
      const h = new Date(item.publishedAt).getHours();
      if (h >= 6 && h <= 17) counts[h - 6]++;
    } else {
      counts[Math.floor(Math.random() * 12)]++;
    }
  });
  return counts;
}

function DonutChart({ labels, data, colors }: { labels: string[]; data: number[]; colors: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} artigos` } },
        },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [labels, data, colors]);

  return <canvas ref={canvasRef} role="img" aria-label="Gráfico de distribuição por interesse" />;
}

function LineChart({ data }: { data: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: ['6h','7h','8h','9h','10h','11h','12h','13h','14h','15h','16h','17h'],
        datasets: [{
          label: 'Publicações',
          data,
          borderColor: '#378ADD',
          backgroundColor: 'rgba(55,138,221,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#378ADD',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#888', font: { size: 11 }, autoSkip: false, maxRotation: 0 },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            ticks: { color: '#888', font: { size: 11 }, stepSize: 2 },
            grid: { color: 'rgba(0,0,0,0.05)' },
            border: { display: false },
          },
        },
      },
    });
    return () => { chartRef.current?.destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} role="img" aria-label="Gráfico de publicações por hora" />;
}

export default function Feed() {
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeInterests, setActiveInterests] = useState<Set<string>>(new Set());

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await feedService.get();
      setFeed(response.data);
      setActiveInterests(new Set(response.data.interests));
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
      setActiveInterests(new Set(response.data.interests));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar feed');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setActiveInterests((prev) => {
      const next = new Set(prev);
      if (next.has(interest) && next.size > 1) next.delete(interest);
      else next.add(interest);
      return next;
    });
  };

  const interestCounts = useMemo(() => {
    if (!feed) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    feed.interests.forEach((i) => (counts[i] = 0));
    feed.items.forEach((item) => {
      if (item.interest && counts[item.interest] !== undefined) counts[item.interest]++;
    });
    return counts;
  }, [feed]);

  const filteredItems = useMemo(() => {
    if (!feed) return [];
    return feed.items.filter((item) => !item.interest || activeInterests.has(item.interest));
  }, [feed, activeInterests]);

  const hourlyData = useMemo(() => feed ? buildHourlyData(feed.items) : [], [feed]);

  const avgReadingTime = useMemo(() => {
    if (!feed?.items.length) return 0;
    const total = feed.items.reduce((acc, item) =>
      acc + (item.readingTime ?? estimateReadingTime(item.summary)), 0);
    return Math.round(total / feed.items.length);
  }, [feed]);

  if (loading) {
    return (
      <div className="fd-root fd-loading-state">
        <div className="fd-loading-inner">
          <div className="fd-spinner" />
          <p>Carregando seu feed…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fd-root fd-error-state">
        <div className="fd-error-inner">
          <span className="fd-error-icon">⚠</span>
          <p>{error}</p>
          <button onClick={loadFeed} className="fd-btn">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-root">
      {/* Header */}
      <div className="fd-header">
        <div className="fd-header-left">
          <h1 className="fd-title">Seu feed personalizado</h1>
          {feed && (
            <p className="fd-subtitle">
              Atualizado em {new Date(feed.generatedAt).toLocaleString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          )}
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="fd-btn fd-refresh-btn">
          <span className={`fd-refresh-icon ${refreshing ? 'fd-spinning' : ''}`}>↻</span>
          {refreshing ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>

      {/* Tags */}
      {feed && (
        <div className="fd-tags">
          {feed.interests.map((interest, idx) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`fd-tag ${activeInterests.has(interest) ? 'fd-tag-active' : ''}`}
              style={activeInterests.has(interest) ? {
                backgroundColor: BADGES[idx % 6].bg,
                borderColor: COLORS[idx % 6] + '55',
                color: BADGES[idx % 6].color,
              } : {}}
            >
              {interest}
            </button>
          ))}
        </div>
      )}

      {/* Metrics */}
      {feed && (
        <div className="fd-metrics">
          <div className="fd-metric">
            <div className="fd-metric-label">Artigos hoje</div>
            <div className="fd-metric-value">{feed.items.length}</div>
            <div className="fd-metric-sub">no seu feed</div>
          </div>
          <div className="fd-metric">
            <div className="fd-metric-label">Fontes</div>
            <div className="fd-metric-value">{new Set(feed.items.map((i) => i.source)).size}</div>
            <div className="fd-metric-sub">distintas</div>
          </div>
          <div className="fd-metric">
            <div className="fd-metric-label">Interesses</div>
            <div className="fd-metric-value">{feed.interests.length}</div>
            <div className="fd-metric-sub">configurados</div>
          </div>
          <div className="fd-metric">
            <div className="fd-metric-label">Tempo médio</div>
            <div className="fd-metric-value">{avgReadingTime} min</div>
            <div className="fd-metric-sub">por artigo</div>
          </div>
        </div>
      )}

      {/* Charts */}
      {feed && (
        <div className="fd-charts">
          <div className="fd-chart-card">
            <p className="fd-chart-title">Artigos por interesse</p>
            <div className="fd-legend">
              {feed.interests.map((interest, idx) => (
                <span key={interest} className="fd-legend-item">
                  <span className="fd-legend-dot" style={{ background: COLORS[idx % 6] }} />
                  {interest} — {interestCounts[interest] ?? 0}
                </span>
              ))}
            </div>
            <div className="fd-donut-wrapper">
              <DonutChart
                labels={feed.interests}
                data={feed.interests.map((i) => interestCounts[i] ?? 0)}
                colors={feed.interests.map((_, idx) => COLORS[idx % 6])}
              />
            </div>
          </div>

          <div className="fd-chart-card">
            <p className="fd-chart-title">Publicações por hora</p>
            <div className="fd-line-wrapper">
              <LineChart data={hourlyData} />
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      {feed && (
        <>
          <p className="fd-section-label">
            {filteredItems.length} artigo{filteredItems.length !== 1 ? 's' : ''}
          </p>

          {filteredItems.length === 0 ? (
            <div className="fd-empty">
              <p>Nenhuma notícia para os filtros selecionados.</p>
              <p>Tente ativar mais interesses acima.</p>
            </div>
          ) : (
            <div className="fd-items-list">
              {filteredItems.map((item, index) => {
                const interestIdx = feed.interests.indexOf(item.interest ?? '');
                const badge = BADGES[(interestIdx >= 0 ? interestIdx : 0) % 6];
                const readTime = item.readingTime ?? estimateReadingTime(item.summary);
                return (
                  <div key={index} className="fd-card">
                    <div className="fd-card-body">
                      {item.interest && (
                        <span className="fd-card-category" style={{ background: badge.bg, color: badge.color }}>
                          {item.interest}
                        </span>
                      )}
                      <h3 className="fd-card-title">{item.title}</h3>
                      <p className="fd-card-summary">{item.summary}</p>
                      <div className="fd-card-meta">
                        <span>⏱ {readTime} min leitura</span>
                        <span className="fd-meta-sep">·</span>
                        <span>{item.source}</span>
                      </div>
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="fd-read-link">
                      Ler →
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
