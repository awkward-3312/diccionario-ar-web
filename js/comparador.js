const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let glosario = [];

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.from('base_datos').select('*');
  if (error) {
    console.error('Error al cargar glosario', error);
    return;
  }
  glosario = data;
  poblarLista();

  document.getElementById('comparar').addEventListener('click', comparar);
  document.getElementById('btn-volver')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
});

function poblarLista() {
  const ordenados = [...glosario].sort((a, b) => a.termino.localeCompare(b.termino));
  const lista = document.getElementById('lista-terminos');
  lista.innerHTML = '';
  ordenados.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.termino;
    lista.appendChild(opt);
  });
}

function obtener(nombre) {
  return glosario.find(t => t.termino === nombre) || {};
}

function comparar() {
  const nombre1 = document.getElementById('termino1').value.trim();
  const nombre2 = document.getElementById('termino2').value.trim();
  if (!nombre1 || !nombre2 || nombre1 === nombre2) {
    alert('Selecciona dos términos distintos');
    return;
  }
  const t1 = obtener(nombre1);
  const t2 = obtener(nombre2);
  mostrarComparacion(t1, t2);
}

function mostrarComparacion(a, b) {
  const campos = [
    ['termino', 'Nombre'],
    ['traduccion', 'Traducción'],
    ['pronunciacion', 'Pronunciación'],
    ['categoria', 'Categoría'],
    ['definicion', 'Definición'],
    ['sinonimos', 'Sinónimos'],
    ['tipo_termino', 'Tipo'],
    ['imagen', 'Imagen']
  ];
  const cont = document.getElementById('resultados');
  cont.innerHTML = '';

  campos.forEach(([clave, etiqueta]) => {
    const v1 = a[clave] || '';
    const v2 = b[clave] || '';
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    div1.className = 'campo';
    div2.className = 'campo';
    div1.innerHTML = generarHTML(etiqueta, v1, clave);
    div2.innerHTML = generarHTML(etiqueta, v2, clave);
    if (normalizar(v1) !== normalizar(v2)) {
      div1.classList.add('diferente');
      div2.classList.add('diferente');
    }
    cont.appendChild(div1);
    cont.appendChild(div2);
  });
}

function generarHTML(label, valor, clave) {
  if (clave === 'imagen' && valor) {
    const url = valor.startsWith('http') ? valor :
      `https://gapivzjnehrkbbnjtvam.supabase.co/storage/v1/object/public/instrumentos/${valor.trim()}`;
    return `<strong>${label}:</strong><br><img src="${url}" alt="${label}">`;
  }
  if (clave === 'sinonimos' && valor) {
    const s = valor.split(',').map(v => `<span>${v.trim()}</span>`).join(' ');
    return `<strong>${label}:</strong><br><div class="sinonimos">${s}</div>`;
  }
  return `<strong>${label}:</strong> ${valor || '-'}`;
}

function normalizar(t) {
  return (t || '').toString().trim().toLowerCase();
}
