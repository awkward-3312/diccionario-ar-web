// === CONFIGURACIÓN SUPABASE ===
const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// === FUNCIONES DE UI ===
function mostrarCampos() {
  const tipo = document.getElementById('tipo').value;
  const traduccion = document.getElementById('traduccion');
  const pronunciacion = document.getElementById('pronunciacion');
  const categoria = document.getElementById('categoria');
  const definicion = document.getElementById('definicion');
  const sinonimos = document.getElementById('sinonimos');
  const formaFarmaceutica = document.getElementById('formaFarmaceutica');

  traduccion.style.display = 'none';
  pronunciacion.style.display = 'none';
  categoria.style.display = 'none';
  definicion.style.display = 'none';
  sinonimos.style.display = 'none';
  formaFarmaceutica.style.display = 'none';

  if (tipo === 'abreviatura') {
    traduccion.style.display = 'block';
  } else if (tipo === 'termino') {
    traduccion.style.display = 'block';
    pronunciacion.style.display = 'block';
    categoria.style.display = 'block';
    definicion.style.display = 'block';
    sinonimos.style.display = 'block';
  } else if (tipo === 'forma') {
    traduccion.style.display = 'block';
    formaFarmaceutica.style.display = 'block';
  } else if (tipo === 'instrumento') {
    traduccion.style.display = 'block';
  }
}

function obtenerFechaISO() {
  return new Date().toISOString();
}

function mostrarPopup(texto, exito = true) {
  const popup = document.getElementById('popupMsg');
  popup.style.backgroundColor = exito ? '#3ae374' : '#ff5e57';
  popup.innerText = texto;
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
}

function toggleLoader(visible) {
  const loader = document.getElementById('loader');
  const botones = document.querySelectorAll('#formulario button');

  loader.style.display = visible ? 'block' : 'none';
  botones.forEach(btn => btn.disabled = visible);
}

// === ENVÍO DEL FORMULARIO ===
window.addEventListener('DOMContentLoaded', () => {
  // ✅ Confirmar que la librería Supabase está disponible
  if (!window.supabase) {
    console.error('❌ Supabase no está cargado correctamente.');
    return;
  }

  // ✅ Inicializar Supabase SOLO si está disponible
  const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  function mostrarCampos() {
    const tipo = document.getElementById('tipo').value;
    const campos = {
      traduccion: document.getElementById('traduccion'),
      pronunciacion: document.getElementById('pronunciacion'),
      categoria: document.getElementById('categoria'),
      definicion: document.getElementById('definicion'),
      sinonimos: document.getElementById('sinonimos'),
      forma: document.getElementById('formaFarmaceutica')
    };

    for (let campo in campos) campos[campo].style.display = 'none';

    if (tipo === 'abreviatura') {
      campos.traduccion.style.display = 'block';
    } else if (tipo === 'termino') {
      campos.traduccion.style.display = 'block';
      campos.pronunciacion.style.display = 'block';
      campos.categoria.style.display = 'block';
      campos.definicion.style.display = 'block';
      campos.sinonimos.style.display = 'block';
    } else if (tipo === 'forma') {
      campos.traduccion.style.display = 'block';
      campos.forma.style.display = 'block';
    } else if (tipo === 'instrumento') {
      campos.traduccion.style.display = 'block';
    }
  }

  function obtenerFechaISO() {
    return new Date().toISOString();
  }

  function toggleLoader(mostrar) {
    const loader = document.getElementById('loader');
    const botones = document.querySelectorAll('#formulario button');
    loader.style.display = mostrar ? 'block' : 'none';
    botones.forEach(btn => btn.disabled = mostrar);
  }

  function mostrarPopup(texto, exito = true) {
    const popup = document.getElementById('popupMsg');
    popup.style.backgroundColor = exito ? '#3ae374' : '#ff5e57';
    popup.innerText = texto;
    popup.style.display = 'block';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 3000);
  }

  // 📌 Escuchar cambio de tipo
  document.getElementById('tipo').addEventListener('change', mostrarCampos);

  // 📌 Enviar formulario
  document.getElementById('formulario').addEventListener('submit', async (e) => {
    e.preventDefault(); // ✅ Evita recarga y "?" en URL
    toggleLoader(true);

    const tipo = document.getElementById('tipo').value;
    const termino = document.getElementById('termino').value.trim();
    const traduccion = document.getElementById('traduccion').value.trim();
    const pronunciacion = document.getElementById('pronunciacion').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const definicion = document.getElementById('definicion').value.trim();
    const sinonimos = document.getElementById('sinonimos').value.trim();
    const forma = document.getElementById('formaFarmaceutica').value.trim();

    const registro = {
      "Término": termino,
      "Traducción": traduccion || null,
      "Tipo de Termino": tipo === 'termino' ? 'Término'
                          : tipo === 'abreviatura' ? 'Abreviatura'
                          : tipo === 'forma' ? 'Forma farmacéutica'
                          : 'Instrumento',
      "Fecha agregado": obtenerFechaISO()
    };

    if (tipo === 'termino') {
      registro["Pronunciación"] = pronunciacion || null;
      registro["Categoría"] = categoria || null;
      registro["Definición"] = definicion || null;
      registro["Sinónimos"] = sinonimos || null;
    }

    if (tipo === 'forma') {
      registro["Forma farmacéutica"] = forma || null;
    }

    const { error } = await supabase
      .from('base_datos') // ⬅️ Cambia por tu tabla real
      .insert([registro]);

    toggleLoader(false);

    if (error) {
      console.error(error);
      mostrarPopup('❌ Error al guardar: ' + error.message, false);
    } else {
      mostrarPopup('✅ Término agregado correctamente');
      e.target.reset();
      mostrarCampos(); // limpia campos dinámicos
    }
  });
});
