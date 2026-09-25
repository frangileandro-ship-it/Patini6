import { useState, useRef } from 'react';

export default function BoletaForm({ boletaInicial, onGuardar, onCancelar }) {
  const hoy = new Date().toISOString().split('T')[0];

  // Inicializa los 6 casilleros con los números de la boleta si está editando
  const numerosIniciales = boletaInicial
    ? boletaInicial.numeros.split(',').map((n) => n.trim())
    : ['', '', '', '', '', ''];

  const [nums, setNums] = useState(numerosIniciales);
  const [tipo, setTipo] = useState(boletaInicial ? boletaInicial.tipo : 'fija');
  const [fechaDesde, setFechaDesde] = useState(
    boletaInicial ? boletaInicial.fecha_desde : hoy
  );
  const [fechaHasta, setFechaHasta] = useState(
    boletaInicial ? boletaInicial.fecha_hasta || '' : ''
  );
  const [error, setError] = useState('');

  const refs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleCambio = (indice, valor) => {
    // Solo permite dígitos, máximo 2 caracteres
    const limpio = valor.replace(/\D/g, '').slice(0, 2);

    const nuevos = [...nums];
    nuevos[indice] = limpio;
    setNums(nuevos);

    // Auto-avance: si escribió 2 dígitos y no es el último, pasa al siguiente
    if (limpio.length === 2 && indice < 5) {
      refs[indice + 1].current.focus();
    }
  };

  const handleTecla = (indice, e) => {
    // Si aprieta Backspace en un casillero vacío, va al anterior
    if (e.key === 'Backspace' && nums[indice] === '' && indice > 0) {
      refs[indice - 1].current.focus();
    }
    // Si aprieta flecha izquierda, va al anterior
    if (e.key === 'ArrowLeft' && indice > 0) {
      refs[indice - 1].current.focus();
    }
    // Si aprieta flecha derecha, va al siguiente
    if (e.key === 'ArrowRight' && indice < 5) {
      refs[indice + 1].current.focus();
    }
  };

  const handlePegar = (e) => {
    // Permite pegar "05,07,18,25,30,41" o "05 07 18 25 30 41" o "050718253041"
    e.preventDefault();
    const texto = e.clipboardData.getData('text');
    const partes = texto.split(/[\s,]+/).filter((p) => p !== '');

    if (partes.length === 6) {
      setNums(partes.map((p) => p.padStart(2, '0').slice(0, 2)));
    } else if (texto.replace(/\D/g, '').length === 12) {
      const soloDigitos = texto.replace(/\D/g, '');
      const nuevos = [];
      for (let i = 0; i < 12; i += 2) {
        nuevos.push(soloDigitos.slice(i, i + 2));
      }
      setNums(nuevos);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validar que los 6 estén completos
    if (nums.some((n) => n === '')) {
      setError('Faltan números por completar');
      return;
    }

    // Validar rango
    for (const n of nums) {
      const num = parseInt(n);
      if (isNaN(num) || num < 0 || num > 45) {
        setError(`Número inválido: ${n}. Debe estar entre 00 y 45.`);
        return;
      }
    }

    // Validar duplicados
    const unicos = new Set(nums);
    if (unicos.size !== 6) {
      setError('No puede haber números repetidos');
      return;
    }

    const desde = fechaDesde;
    const hasta = tipo === 'del_dia' ? fechaDesde : fechaHasta || null;

    onGuardar({
      numeros: nums.map((n) => n.padStart(2, '0')).join(','),
      tipo,
      fecha_desde: desde,
      fecha_hasta: hasta,
    });
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.titulo}>
        {boletaInicial ? 'Editar boleta' : 'Nueva boleta'}
      </h3>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Números (00 a 45)</label>
        <div style={styles.casilleros}>
          {nums.map((n, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              value={n}
              onChange={(e) => handleCambio(i, e.target.value)}
              onKeyDown={(e) => handleTecla(i, e)}
              onPaste={handlePegar}
              style={styles.casillero}
              maxLength={2}
              placeholder="--"
            />
          ))}
        </div>
        <small style={styles.ayuda}>
          Escribí los 2 dígitos y el cursor pasa solo al siguiente. También podés
          pegar los 6 números separados por coma.
        </small>

        <label style={styles.label}>
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={styles.input}
          >
            <option value="fija">Fija (todos los sorteos)</option>
            <option value="del_dia">Del día (solo un sorteo)</option>
          </select>
        </label>

        <label style={styles.label}>
          {tipo === 'fija' ? 'Vigente desde' : 'Fecha del sorteo'}
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        {tipo === 'fija' && (
          <label style={styles.label}>
            Vigente hasta (opcional)
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={styles.input}
            />
            <small style={styles.ayuda}>
              Dejalo vacío si querés que siga vigente indefinidamente
            </small>
          </label>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.botones}>
          <button type="submit" style={styles.botonGuardar}>
            {boletaInicial ? 'Guardar cambios' : 'Cargar boleta'}
          </button>
          {onCancelar && (
            <button type="button" onClick={onCancelar} style={styles.botonCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #eee',
    marginBottom: '25px',
  },
  titulo: {
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '18px',
    color: '#1a1a1a',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    color: '#666',
    gap: '5px',
  },
  casilleros: {
    display: 'flex',
    gap: '8px',
    marginBottom: '5px',
  },
  casillero: {
    width: '50px',
    height: '50px',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    color: '#1a1a1a',
  },
  input: {
    padding: '8px 10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  ayuda: {
    color: '#999',
    fontSize: '12px',
  },
  error: {
    padding: '10px',
    background: '#fee',
    color: '#c00',
    borderRadius: '6px',
    fontSize: '13px',
  },
  botones: {
    display: 'flex',
    gap: '10px',
    marginTop: '5px',
  },
  botonGuardar: {
    padding: '9px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  botonCancelar: {
    padding: '9px 20px',
    fontSize: '14px',
    background: '#eee',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};