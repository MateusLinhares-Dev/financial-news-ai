import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>📈 Financial News AI</h1>
        </div>
        <div className="navbar-menu">
          {/* Usar Link evita o reload da página inteira */}
          <Link to="/feed" className="nav-link">Feed</Link>
          <Link to="/preferences" className="nav-link">Preferências</Link>
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={logout} className="logout-btn">
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
