document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://gpnrtcvtwxsoasrnmhof.supabase.co';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbnJ0Y3Z0d3hzb2Fzcm5taG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDI3MTIsImV4cCI6MjA2NTkxODcxMn0.s7e9BAFcsfUbiWAETf44sUxSGSoQ6xvZF9gPTebcMWc';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  const loader = document.getElementById('loader');

  const views = document.querySelectorAll('.dashboard-view');
  const buttons = document.querySelectorAll('.menu-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(view).classList.add('active');
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
  } catch (err) {
    loader.style.display = 'none';
    console.error('Error al cargar los términos:', err);
    mostrarError();
    return;
  }

  // Totales por tipo
  const total = data.length;
  const porTipo = {
    abreviatura: 0,
    'forma farmacéutica': 0,
    'término completo': 0,
    instrumento: 0
  };

  data.forEach(t => {
    const tipo = t.tipo_termino?.toLowerCase();
    if (porTipo[tipo] !== undefined) porTipo[tipo]++;
  });

  // Mostrar en tarjetas resumen
  document.getElementById('totalTerminos').querySelector('.count').textContent = total;
  document.getElementById('totalAbreviaturas').querySelector('.count').textContent = porTipo.abreviatura;
  document.getElementById('totalFormas').querySelector('.count').textContent = porTipo['forma farmacéutica'];
  document.getElementById('totalTerminosCompletos').querySelector('.count').textContent = porTipo['término completo'];
  document.getElementById('totalInstrumentos').querySelector('.count').textContent = porTipo.instrumento;

  // Renderizar tablas
  renderizarTabla(
    'abreviaturas',
    ['termino', 'traduccion', 'tipo_termino'],
    data.filter(d => (d.tipo_termino || '').toLowerCase() === 'abreviatura')
  );
  renderizarTabla(
    'formas',
    ['termino', 'traduccion', 'tipo_termino', 'forma_farmaceutica'],
    data.filter(d => (d.tipo_termino || '').toLowerCase() === 'forma farmacéutica')
  );
  renderizarTabla(
    'terminos',
    ['termino', 'traduccion', 'pronunciacion', 'categoria', 'definicion', 'sinonimos', 'tipo_termino'],
    data.filter(d => (d.tipo_termino || '').toLowerCase() === 'término completo')
  );
  renderizarTabla(
    'instrumentos',
    ['termino', 'traduccion', 'pronunciacion', 'categoria', 'definicion', 'sinonimos', 'tipo_termino'],
    data.filter(d => (d.tipo_termino || '').toLowerCase() === 'instrumento')
  );

  function renderizarTabla(id, campos, filas) {
    const tbody = document.querySelector(`#${id} tbody`);
    tbody.innerHTML = '';
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
