import { useState } from 'react';
import client from '../api/client';
import patito from '../assets/patito.png';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modo, setModo] = useState('login');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const endpoint = modo === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await client.post(endpoint, { email, password });

      if (data.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={patito} alt="Patini 6" style={styles.logo} />
        <h1 style={styles.titulo}>Patini 6</h1>
        <h2 style={styles.subtitulo}>
          {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={cargando} style={styles.boton}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <p style={styles.cambio}>
          {modo === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button
            type="button"
            onClick={() => setModo(modo === 'login' ? 'register' : 'login')}
            style={styles.linkBoton}
          >
            {modo === 'login' ? 'Registrate' : 'Iniciá sesión'}
          </button>
        </p>

        <p style={styles.firma}>Creado por Pato Frangi</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
    fontFamily: 'system-ui, sans-serif',
    padding: '12px',
  },
  card: {
    background: 'white',
    padding: '30px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  logo: {
    display: 'block',
    margin: '0 auto 10px',
    width: '120px',
    height: '120px',
    objectFit: 'contain',
  },
  titulo: {
    margin: 0,
    fontSize: '28px',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitulo: {
    marginTop: '8px',
    marginBottom: '24px',
    fontSize: '15px',
    fontWeight: 'normal',
    textAlign: 'center',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  boton: {
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    padding: '10px',
    background: '#fee',
    color: '#c00',
    borderRadius: '6px',
    fontSize: '13px',
  },
  cambio: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
  },
  linkBoton: {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    padding: 0,
  },
  firma: {
    marginTop: '25px',
    marginBottom: 0,
    textAlign: 'center',
    fontSize: '12px',
    color: '#aaa',
    fontStyle: 'italic',
  },
};