import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  // adicione outros campos relevantes do usuário aqui
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login'); // Navegação limpa, sem recarregar a página
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return { user, isAuthenticated, logout };
}
