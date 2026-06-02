import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Preferences from './pages/Preferences';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import './App.css';

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
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
