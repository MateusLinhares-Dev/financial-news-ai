import { useState, useEffect } from 'react';
import { preferencesService } from '../services/api';
import '../styles/Preferences.css';

export default function Preferences() {
  const [preferences, setPreferences] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await preferencesService.get();
      setPreferences(response.data.preferences || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && !preferences.includes(newTopic)) {
      setPreferences([...preferences, newTopic]);
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setPreferences(preferences.filter((p) => p !== topic));
  };

  const savePreferences = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await preferencesService.update(preferences);
      setSuccess('Preferências salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="preferences-container"><p>Carregando...</p></div>;
  }

  return (
    <div className="preferences-container">
      <h1>Minhas Preferências</h1>
      <p className="subtitle">Selecione os temas de seu interesse para personalizar seu feed</p>

      <div className="preferences-form">
        <div className="input-group">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTopic()}
            placeholder="Ex: PETR4, setor bancário, taxa Selic"
          />
          <button onClick={addTopic} className="add-btn">
            Adicionar
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="topics-list">
          {preferences.length === 0 ? (
            <p className="empty-state">Nenhuma preferência adicionada ainda</p>
          ) : (
            preferences.map((topic) => (
              <div key={topic} className="topic-item">
                <span>{topic}</span>
                <button
                  onClick={() => removeTopic(topic)}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={savePreferences}
          disabled={saving}
          className="save-btn"
        >
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}
