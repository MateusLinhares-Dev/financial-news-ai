import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Preferences from './pages/Preferences';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/auth/login" />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>📈 Financial News AI</h1>
        </div>
        <div className="navbar-menu">
          <a href="/feed" className="nav-link">Feed</a>
          <a href="/preferences" className="nav-link">Preferências</a>
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas de autenticação */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Layout>
                <Feed />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/preferences"
          element={
            <PrivateRoute>
              <Layout>
                <Preferences />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Redirecionamentos padrão */}
        <Route path="/" element={<Navigate to="/feed" />} />
        <Route path="/auth" element={<Navigate to="/auth/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
