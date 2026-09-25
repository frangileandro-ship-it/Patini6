import { useState } from 'react';
import client from '../api/client';

const TIPOS_SORTEO = {
  tradicional: 'Tradicional',
  segunda: 'La Segunda',
  revancha: 'Revancha',
  siempre_sale: 'Siempre Sale',
};

export default function Principal({ user, onLogout, onIrABoletas, onIrAEstadisticas }) {
  const hoy = new Date().toISOString().split('T')[0];
  const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [fechaDesde, setFechaDesde] = useState(hace30Dias);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [resultados, setResultados] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const consultar = async () => {
    setCargando(true);
    setError('');
    setMensaje('');
    setResultados(null);

    try {
      const { data } = await client.post('/consultar', {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      });

      if (data.ok) {
        setResultados(data.resultados);
        if (data.message) setMensaje(data.message);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const renderNumeros = (sorteados, acertados) => {
    const nums = sorteados.split(',');
    return nums.map((n, i) => {
      const esAcierto = acertados.includes(n.trim());
      return (
        <span key={i} style={esAcierto ? styles.numAcierto : styles.num}>
          {n.trim()}
        </span>
      );
    });
  };

  const agruparPorFecha = (res) => {
    const fechas = {};
    res.forEach((r) => {
      if (!fechas[r.fecha]) {
        fechas[r.fecha] = {
          fecha: r.fecha,
          numero_sorteo: r.numero_sorteo,
          boletas: {},
        };
      }
      const claveBoleta = r.boleta_id;
      if (!fechas[r.fecha].boletas[claveBoleta]) {
        fechas[r.fecha].boletas[claveBoleta] = {
          boleta_id: r.boleta_id,
          boleta_tipo: r.boleta_tipo,
          boleta_numeros: r.boleta_numeros,
          items: [],
        };
      }
      fechas[r.fecha].boletas[claveBoleta].items.push(r);
    });

    return Object.values(fechas).map((f) => ({
      ...f,
      boletas: Object.values(f.boletas),
    }));
  };

  const filaStyle = (aciertos) => {
    if (aciertos >= 6) {
      return { ...styles.tr, background: '#c8e6c9', borderLeft: '4px solid #2e7d32' };
    }
    if (aciertos === 5) {
      return { ...styles.tr, background: '#fff3cd', borderLeft: '4px solid #f9a825' };
    }
    if (aciertos === 4) {
      return { ...styles.tr, background: '#e3f2fd', borderLeft: '4px solid #1565c0' };
    }
    return styles.tr;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titulo}>Patiti 6</h1>
        <div style={styles.headerBotones}>
          <button onClick={onIrABoletas} style={styles.botonBoletas}>
            Mis Boletas
          </button>
          <button onClick={onIrAEstadisticas} style={styles.botonEstadisticas}>
            Estadísticas
          </button>
          <button onClick={onLogout} style={styles.botonSalir}>Salir</button>
        </div>
      </header>

      <div style={styles.userBar}>
        <span style={styles.userEmail}>{user.email}</span>
      </div>

      <div style={styles.filtros}>
        <label style={styles.label}>
          Desde
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Hasta
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            style={styles.input}
          />
        </label>
        <button onClick={consultar} disabled={cargando} style={styles.botonConsultar}>
          {cargando ? 'Consultando...' : 'Consultar Jugadas'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {mensaje && <div style={styles.mensaje}>{mensaje}</div>}

      {resultados && resultados.length === 0 && (
        <div style={styles.vacio}>No se encontraron sorteos en ese rango de fechas.</div>
      )}

      {resultados && resultados.length > 0 && (
        <div>
          {agruparPorFecha(resultados).map((grupo, idx) => (
            <div key={idx} style={styles.grupoDia}>
              <div style={styles.diaHeader}>
                <span style={styles.diaTexto}>{grupo.fecha}</span>
                <span style={styles.diaSorteo}>Sorteo #{grupo.numero_sorteo}</span>
              </div>

              {grupo.boletas.map((b, bIdx) => (
                <div key={bIdx}>
                  <div style={styles.boletaHeader}>
                    <span style={styles.boletaEtiqueta}>
                      Boleta {b.boleta_numeros}
                    </span>
                    <span
                      style={
                        b.boleta_tipo === 'fija'
                          ? styles.badgeFija
                          : styles.badgeDia
                      }
                    >
                      {b.boleta_tipo === 'fija' ? 'Fija' : 'Del día'}
                    </span>
                  </div>

                  <div style={styles.tablaWrapper}>
                    <table style={styles.tabla}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Tipo</th>
                          <th style={styles.th}>Números</th>
                          <th style={styles.th}>Aciertos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.items.map((r, i) => (
                          <tr key={i} style={filaStyle(r.aciertos)}>
                            <td style={styles.td}>
                              {TIPOS_SORTEO[r.tipo_sorteo] || r.tipo_sorteo}
                            </td>
                            <td style={styles.td}>
                              {renderNumeros(r.numeros_sorteados, r.numeros_acertados)}
                            </td>
                            <td style={{ ...styles.td, ...styles.tdAciertos }}>
                              {r.aciertos}
                            </td>
                          </tr>
                        ))}
                        <tr style={filaStyle(b.items[0].aciertos_extra)}>
                          <td style={styles.td}><strong>Premio Extra</strong></td>
                          <td style={styles.td}>
                            <em style={styles.textoExtra}>
                              18 números (Trad + Seg + Rev)
                            </em>
                          </td>
                          <td style={{ ...styles.td, ...styles.tdAciertos }}>
                            {b.items[0].aciertos_extra}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
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
    maxWidth: '1000px',
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
    marginBottom: '10px',
    borderBottom: '1px solid #eee',
    paddingBottom: '12px',
  },
  titulo: {
    margin: 0,
    fontSize: '22px',
    color: '#1a1a1a',
  },
  headerBotones: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
  },
  botonBoletas: {
    padding: '6px 10px',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  botonEstadisticas: {
    padding: '6px 10px',
    background: '#0a7d2e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  botonSalir: {
    padding: '6px 10px',
    background: '#eee',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  userBar: {
    marginBottom: '15px',
    textAlign: 'right',
  },
  userEmail: {
    color: '#666',
    fontSize: '12px',
  },
  filtros: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'flex-end',
    marginBottom: '20px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    color: '#666',
    gap: '5px',
    flex: '1 1 130px',
  },
  input: {
    padding: '8px 10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    width: '100%',
    boxSizing: 'border-box',
  },
  botonConsultar: {
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: '1 1 100%',
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c00',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '13px',
  },
  mensaje: {
    padding: '12px',
    background: '#eef',
    color: '#0066cc',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '13px',
  },
  vacio: {
    padding: '30px',
    textAlign: 'center',
    background: '#f9f9f9',
    borderRadius: '8px',
    color: '#666',
  },
  grupoDia: {
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  diaHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 12px',
    background: '#0066cc',
    color: 'white',
  },
  diaTexto: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  diaSorteo: {
    fontSize: '12px',
    opacity: 0.9,
  },
  boletaHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 12px',
    background: '#f0f7ff',
    borderTop: '1px solid #d6e6f7',
    borderBottom: '1px solid #d6e6f7',
  },
  boletaEtiqueta: {
    fontWeight: 'bold',
    fontSize: '13px',
    color: '#004b8f',
    letterSpacing: '0.5px',
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
  tablaWrapper: {
    overflowX: 'auto',
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    textAlign: 'left',
    padding: '8px 6px',
    background: '#f5f5f5',
    borderBottom: '2px solid #ddd',
    fontSize: '11px',
    color: '#555',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '8px 6px',
    verticalAlign: 'middle',
    fontSize: '12px',
  },
  tdAciertos: {
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
  },
  num: {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '1px',
    background: '#f0f0f0',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#666',
  },
  numAcierto: {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '1px',
    background: '#d4f4dd',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#0a7d2e',
    fontWeight: 'bold',
  },
  textoExtra: {
    color: '#666',
    fontSize: '11px',
  },
  firma: {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#aaa',
    fontStyle: 'italic',
  },
};