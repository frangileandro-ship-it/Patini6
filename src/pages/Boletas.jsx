import { useState, useEffect } from 'react';
import client from '../api/client';
import BoletaForm from './Boletaform';

export default function Boletas({ onVolver }) {
  const [boletas, setBoletas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await client.get('/boletas');
      if (data.ok) setBoletas(data.boletas);
      else setError(data.error || 'Error al cargar boletas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (datos) => {
    try {
      const { data } = await client.post('/boletas', datos);
      if (data.ok) {
        setCreando(false);
        cargar();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear');
    }
  };

  const editar = async (datos) => {
    try {
      const { data } = await client.put(`/boletas/${editando.id}`, datos);
      if (data.ok) {
        setEditando(null);
        cargar();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al editar');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta boleta?')) return;
    try {
      const { data } = await client.delete(`/boletas/${id}`);
      if (data.ok) cargar();
      else setError(data.error);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titulo}>Mis Boletas · Patini 6</h1>
        <button onClick={onVolver} style={styles.botonVolver}>
          ← Volver a consultar
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {!creando && !editando && (
        <button onClick={() => setCreando(true)} style={styles.botonNueva}>
          + Cargar nueva boleta
        </button>
      )}

      {creando && (
        <BoletaForm
          onGuardar={crear}
          onCancelar={() => setCreando(false)}
        />
      )}

      {editando && (
        <BoletaForm
          boletaInicial={editando}
          onGuardar={editar}
          onCancelar={() => setEditando(null)}
        />
      )}

      {cargando && <div style={styles.cargando}>Cargando...</div>}

      {!cargando && boletas.length === 0 && !creando && (
        <div style={styles.vacio}>
          Todavía no cargaste boletas. Empezá con el botón de arriba.
        </div>
      )}

      {!cargando && boletas.length > 0 && (
        <div style={styles.lista}>
          {boletas.map((b) => (
            <div key={b.id} style={styles.boletaCard}>
              <div style={styles.boletaInfo}>
                <div style={styles.boletaNumeros}>{b.numeros}</div>
                <div style={styles.boletaDetalles}>
                  <span style={b.tipo === 'fija' ? styles.badgeFija : styles.badgeDia}>
                    {b.tipo === 'fija' ? 'Fija' : 'Del día'}
                  </span>
                  <span style={styles.fechas}>
                    Desde {b.fecha_desde}
                    {b.fecha_hasta && ` · Hasta ${b.fecha_hasta}`}
                  </span>
                </div>
              </div>
              <div style={styles.boletaBotones}>
                <button onClick={() => setEditando(b)} style={styles.botonEditar}>
                  Editar
                </button>
                <button onClick={() => eliminar(b.id)} style={styles.botonEliminar}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={styles.firma}>Creado por Pato Frangi</p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
  },
  titulo: {
    margin: 0,
    fontSize: '24px',
    color: '#1a1a1a',
  },
  botonVolver: {
    padding: '6px 12px',
    background: '#eee',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  botonNueva: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  cargando: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
  vacio: {
    padding: '40px 20px',
    textAlign: 'center',
    background: '#f9f9f9',
    borderRadius: '8px',
    color: '#666',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  boletaCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: 'white',
    border: '1px solid #eee',
    borderRadius: '8px',
  },
  boletaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  boletaNumeros: {
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    color: '#1a1a1a',
  },
  boletaDetalles: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    fontSize: '13px',
    color: '#666',
  },
  badgeFija: {
    background: '#e3f2fd',
    color: '#1565c0',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  badgeDia: {
    background: '#fff3cd',
    color: '#f9a825',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  fechas: {
    fontSize: '12px',
    color: '#888',
  },
  boletaBotones: {
    display: 'flex',
    gap: '8px',
  },
  botonEditar: {
    padding: '6px 12px',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  botonEliminar: {
    padding: '6px 12px',
    background: '#fee',
    color: '#c00',
    border: '1px solid #fcc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c00',
    borderRadius: '6px',
    marginBottom: '15px',
  },
    firma: {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#aaa',
    fontStyle: 'italic',
  },
};