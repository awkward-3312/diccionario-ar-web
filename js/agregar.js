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

// === FUNCIÓN PARA OBTENER FECHA ISO ===
function obtenerFechaISO() {
  return new Date().toISOString();
}

// === FUNCIÓN PARA MOSTRAR MENSAJE EMERGENTE ===
function mostrarPopup(texto, exito = true) {
  const popup = document.getElementById('popupMsg');
  popup.style.backgroundColor = exito ? '#3ae374' : '#ff5e57';
  popup.innerText = texto;
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
}

// === ENVÍO DE FORMULARIO ===
document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const tipo = document.getElementById('tipo').value;
  const termino = document.getElementById('termino').value.trim();
  const traduccion = document.getElementById('traduccion').value.trim();
  const pronunciacion = document.getElementById('pronunciacion').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const definicion = document.getElementById('definicion').value.trim();
  const sinonimos = document.getElementById('sinonimos').value.trim();
  const forma = document.getElementById('formaFarmaceutica').value.trim();

  const nuevo = {
    "Término": termino,
    "Traducción": traduccion || null,
    "Tipo de Termino": tipo === 'termino' ? 'Término'
                        : tipo === 'abreviatura' ? 'Abreviatura'
                        : tipo === 'forma' ? 'Forma farmacéutica'
                        : 'Instrumento',
    "Fecha agregado": obtenerFechaISO()
  };

  if (tipo === 'termino') {
    nuevo["Pronunciación"] = pronunciacion || null;
    nuevo["Categoría"] = categoria || null;
    nuevo["Definición"] = definicion || null;
    nuevo["Sinónimos"] = sinonimos || null;
  }

  if (tipo === 'forma') {
    nuevo["Forma farmacéutica"] = forma || null;
  }

  const { data, error } = await supabase
    .from('base_datos')
    .insert([nuevo]);

  if (error) {
    console.error(error);
    mostrarPopup('❌ Error al guardar: ' + error.message, false);
  } else {
    mostrarPopup('✅ Término agregado correctamente');
    e.target.reset();
    mostrarCampos(); // Oculta campos dinámicos después de enviar
  }
});
