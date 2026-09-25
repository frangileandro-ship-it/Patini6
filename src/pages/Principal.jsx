import { useState, useEffect } from 'react';
import client from '../api/client';
import BoletaForm from './BoletaForm';

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
        <h1 style={styles.titulo}>Mis Boletas</h1>
        <button onClick={onVolver} style={styles.botonVolver}>
          ← Volver
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
    padding: '12px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '12px',
  },
  titulo: {
    margin: 0,
    fontSize: '22px',
    color: '#1a1a1a',
  },
  botonVolver: {
    padding: '6px 10px',
    background: '#eee',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  botonNueva: {
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 'bold',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
    width: '100%',
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
    gap: '10px',
  },
  boletaCard: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'white',
    border: '1px solid #eee',
    borderRadius: '8px',
  },
  boletaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: '1 1 200px',
  },
  boletaNumeros: {
    fontSize: '15px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    color: '#1a1a1a',
  },
  boletaDetalles: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    fontSize: '12px',
    color: '#666',
  },
  badgeFija: {
    background: '#e3f2fd',
    color: '#1565c0',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  badgeDia: {
    background: '#fff3cd',
    color: '#f9a825',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  fechas: {
    fontSize: '11px',
    color: '#888',
  },
  boletaBotones: {
    display: 'flex',
    gap: '6px',
  },
  botonEditar: {
    padding: '6px 10px',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  botonEliminar: {
    padding: '6px 10px',
    background: '#fee',
    color: '#c00',
    border: '1px solid #fcc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c00',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '13px',
  },
  firma: {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#aaa',
    fontStyle: 'italic',
  },
};