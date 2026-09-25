import { useState, useEffect } from 'react';
import client from '../api/client';

export default function Estadisticas({ onVolver }) {
  const [topGlobal, setTopGlobal] = useState(null);
  const [misNumeros, setMisNumeros] = useState(null);
  const [totalSorteosGlobal, setTotalSorteosGlobal] = useState(0);
  const [totalSorteosMios, setTotalSorteosMios] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const [resGlobal, resMios] = await Promise.all([
          client.get('/estadisticas/top-numeros'),
          client.get('/estadisticas/mis-numeros'),
        ]);

        if (resGlobal.data.ok) {
          setTopGlobal(resGlobal.data.ranking);
          setTotalSorteosGlobal(resGlobal.data.totalSorteos);
        }
        if (resMios.data.ok) {
          setMisNumeros(resMios.data.ranking);
          setTotalSorteosMios(resMios.data.totalSorteos);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error de conexión');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titulo}>Estadísticas</h1>
        <button onClick={onVolver} style={styles.botonVolver}>
          ← Volver a consultar
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {cargando && <div style={styles.cargando}>Cargando estadísticas...</div>}

      {!cargando && topGlobal && (
        <section style={styles.seccion}>
          <h2 style={styles.seccionTitulo}>
            TOP 10 · Números que más salen
          </h2>
          <p style={styles.subtitulo}>
            Sobre {totalSorteosGlobal} sorteos registrados
          </p>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Número</th>
                <th style={styles.th}>Veces</th>
                <th style={styles.th}>%</th>
              </tr>
            </thead>
            <tbody>
              {topGlobal.map((item, i) => (
                <tr key={item.numero} style={i === 0 ? styles.trDestacada : styles.tr}>
                  <td style={styles.tdPosicion}>{i + 1}</td>
                  <td style={styles.tdNumero}>{item.numero}</td>
                  <td style={styles.td}>{item.veces}</td>
                  <td style={styles.td}>{item.porcentaje}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {!cargando && misNumeros && misNumeros.length > 0 && (
        <section style={styles.seccion}>
          <h2 style={styles.seccionTitulo}>
            Tus números · Ranking por frecuencia
          </h2>
          <p style={styles.subtitulo}>
            Sobre {totalSorteosMios} sorteos registrados
          </p>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Número</th>
                <th style={styles.th}>Veces</th>
                <th style={styles.th}>%</th>
              </tr>
            </thead>
            <tbody>
              {misNumeros.map((item, i) => (
                <tr key={item.numero} style={i === 0 ? styles.trDestacada : styles.tr}>
                  <td style={styles.tdPosicion}>{i + 1}</td>
                  <td style={styles.tdNumero}>{item.numero}</td>
                  <td style={styles.td}>{item.veces}</td>
                  <td style={styles.td}>{item.porcentaje}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {!cargando && misNumeros && misNumeros.length === 0 && (
        <div style={styles.vacio}>
          Todavía no cargaste boletas activas. Cargá una para ver el ranking de tus números.
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
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
  },
  titulo: {
    margin: 0,
    fontSize: '28px',
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
  seccion: {
    marginBottom: '40px',
  },
  seccionTitulo: {
    fontSize: '18px',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  subtitulo: {
    fontSize: '13px',
    color: '#888',
    marginTop: 0,
    marginBottom: '15px',
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  th: {
    textAlign: 'left',
    padding: '10px 15px',
    background: '#0066cc',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  tr: {
    background: 'white',
    borderBottom: '1px solid #eee',
  },
  trDestacada: {
    background: '#c8e6c9',
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '10px 15px',
    verticalAlign: 'middle',
    color: '#333',
  },
  tdPosicion: {
    padding: '10px 15px',
    verticalAlign: 'middle',
    color: '#999',
    fontWeight: 'bold',
    width: '40px',
  },
  tdNumero: {
    padding: '10px 15px',
    verticalAlign: 'middle',
    fontWeight: 'bold',
    fontSize: '16px',
    letterSpacing: '1px',
    color: '#1a1a1a',
  },
  cargando: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
  vacio: {
    padding: '30px',
    textAlign: 'center',
    background: '#f9f9f9',
    borderRadius: '8px',
    color: '#666',
    marginBottom: '30px',
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