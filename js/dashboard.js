document.addEventListener('DOMContentLoaded', async () => {
const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  const loader = document.getElementById('loader');

  const views = document.querySelectorAll('.dashboard-view');
  const buttons = document.querySelectorAll('.menu-btn');

  // Activar sección y botón al hacer clic
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(view).classList.add('active');
      console.log(`Vista activa: ${view}`);
    });
  });

  document.getElementById('hamburger').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('collapsed');
  });

  document.getElementById('btn-volver')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  let data = [];
  loader.style.display = 'block';

  try {
    const res = await supabase.from('base_datos').select('*');
    loader.style.display = 'none';
    if (res.error) throw res.error;
    data = Array.isArray(res.data) ? res.data : [];
    console.log("✅ Datos recibidos:", data);
  } catch (err) {
    loader.style.display = 'none';
    console.error('❌ Error al cargar los términos:', err);
    mostrarError();
    return;
  }

  function normalizarTipo(texto) {
    return (texto || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function obtenerClaveTipo(tipo) {
    const t = normalizarTipo(tipo);
    if (t.startsWith('abrevi')) return 'abreviatura';
    if (t.includes('forma') && t.includes('farm')) return 'forma farmacéutica';
    if (t.includes('instrument')) return 'instrumento';
    return 'término completo';
  }

  const total = data.length;
  const porTipo = {
    abreviatura: 0,
    'forma farmacéutica': 0,
    'término completo': 0,
    instrumento: 0
  };

  data.forEach(t => {
    const clave = obtenerClaveTipo(t.tipo_termino);
    if (porTipo[clave] !== undefined) porTipo[clave]++;
  });

  document.getElementById('totalTerminos').querySelector('.count').textContent = total;
  document.getElementById('totalAbreviaturas').querySelector('.count').textContent = porTipo.abreviatura;
  document.getElementById('totalFormas').querySelector('.count').textContent = porTipo['forma farmacéutica'];
  document.getElementById('totalTerminosCompletos').querySelector('.count').textContent = porTipo['término completo'];
  document.getElementById('totalInstrumentos').querySelector('.count').textContent = porTipo.instrumento;

  renderizarTabla(
    'abreviaturas',
    ['termino', 'traduccion', 'tipo_termino'],
    data.filter(d => obtenerClaveTipo(d.tipo_termino) === 'abreviatura')
  );
  renderizarTabla(
    'formas',
    ['termino', 'traduccion', 'tipo_termino', 'forma_farmaceutica'],
    data.filter(d => obtenerClaveTipo(d.tipo_termino) === 'forma farmacéutica')
  );
  renderizarTabla(
    'terminos',
    ['termino', 'traduccion', 'pronunciacion', 'categoria', 'definicion', 'sinonimos', 'tipo_termino'],
    data.filter(d => obtenerClaveTipo(d.tipo_termino) === 'término completo')
  );
  renderizarTabla(
    'instrumentos',
    ['termino', 'traduccion', 'pronunciacion', 'categoria', 'definicion', 'sinonimos', 'tipo_termino'],
    data.filter(d => obtenerClaveTipo(d.tipo_termino) === 'instrumento')
  );

  function renderizarTabla(id, campos, filas) {
    const tbody = document.querySelector(`#${id} tbody`);
    if (!tbody) {
      console.warn(`⚠️ No se encontró tbody para ${id}`);
      return;
    }
    tbody.innerHTML = '';
    if (filas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${campos.length}" style="text-align:center;">Sin resultados</td></tr>`;
    } else {
      filas.forEach(f => {
        const tr = document.createElement('tr');
        campos.forEach(campo => {
          const td = document.createElement('td');
          td.textContent = f[campo] || '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    console.log(`✅ Tabla ${id} renderizada con ${filas.length} filas`);
  }

  function mostrarError() {
    const counts = document.querySelectorAll('#resumen .count');
    counts.forEach(c => (c.textContent = '-'));
    ['abreviaturas', 'formas', 'terminos', 'instrumentos'].forEach(id => {
      const tbody = document.querySelector(`#${id} tbody`);
      if (tbody)
        tbody.innerHTML =
          "<tr><td colspan='10' style='text-align:center;'>❌ Error al cargar.</td></tr>";
    });
  }
});
