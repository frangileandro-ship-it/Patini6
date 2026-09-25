import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Principal from './pages/Principal';
import Boletas from './pages/Boletas';

export default function App() {
  const [user, setUser] = useState(null);
  const [pantalla, setPantalla] = useState('consultar');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
      setUser({ email });
    }
  }, []);

  const handleLogin = (u) => {
    if (u && u.email) {
      localStorage.setItem('email', u.email);
    }
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
    setPantalla('consultar');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (pantalla === 'boletas') {
    return <Boletas onVolver={() => setPantalla('consultar')} />;
  }

  return (
    <Principal
      user={user}
      onLogout={handleLogout}
      onIrABoletas={() => setPantalla('boletas')}
    />
  );
}