// ✅ Configuración Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Modo claro/oscuro
function toggleModo() {
  const body = document.body;
  const icono = document.getElementById("icono-modo");
  const esClaro = body.classList.toggle("light-mode");
  icono.className = esClaro ? "fas fa-sun" : "fas fa-moon";
  localStorage.setItem("modoClaro", esClaro ? "1" : "0");
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
    document.getElementById("icono-modo").className = "fas fa-sun";
  }

  document.getElementById("formulario").addEventListener("submit", guardarTermino);
});

// ✅ Mostrar/ocultar campos según tipo
function mostrarCampos() {
  const tipo = document.getElementById("tipo").value;
  const campos = {
    traduccion: "block",
    pronunciacion: "block",
    categoria: "block",
    definicion: "block",
    sinonimos: "block"
  };

  if (tipo === "abreviatura") {
    campos.traduccion = "block";
    campos.pronunciacion = "none";
    campos.categoria = "none";
    campos.definicion = "none";
    campos.sinonimos = "none";
  } else if (tipo === "forma") {
    campos.traduccion = "none";
    campos.pronunciacion = "none";
    campos.categoria = "none";
    campos.definicion = "block";
    campos.sinonimos = "none";
  }

  Object.keys(campos).forEach(id => {
    document.getElementById(id).style.display = campos[id];
  });
}

// ✅ Guardar término en Supabase
async function guardarTermino(e) {
  e.preventDefault();

  const loader = document.getElementById("loader");
  loader.style.display = "block";

  const termino = document.getElementById("termino").value.trim();
  const tipo = document.getElementById("tipo").value;
  const traduccion = document.getElementById("traduccion").value.trim();
  const pronunciacion = document.getElementById("pronunciacion").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const definicion = document.getElementById("definicion").value.trim();
  const sinonimos = document.getElementById("sinonimos").value.trim();

  if (!termino || !tipo) {
    mostrarMensaje("❌ Faltan campos obligatorios");
    loader.style.display = "none";
    return;
  }

  // Validar si ya existe
  const { data: existentes, error: errorExistencia } = await supabase
    .from('base_datos')
    .select('Término')
    .ilike('Término', termino);

  if (errorExistencia) {
    console.error("Error al verificar existencia:", errorExistencia);
    mostrarMensaje("❌ Error verificando duplicados.");
    loader.style.display = "none";
    return;
  }

  if (existentes.length > 0) {
    mostrarMensaje("⚠️ Este término ya existe.");
    loader.style.display = "none";
    return;
  }

  // Insertar en Supabase
  const { error } = await supabase
    .from('base_datos')
    .insert([{
      Término: termino,
      Tipo: tipo,
      Traducción: traduccion || null,
      Pronunciación: pronunciacion || null,
      Categoría: categoria || null,
      Definición: definicion || null,
      Sinónimos: sinonimos || null,
      fecha_agregado: new Date().toISOString()
    }]);

  loader.style.display = "none";

  if (error) {
    console.error("Error al guardar:", error);
    mostrarMensaje("❌ Error al guardar el término.");
  } else {
    mostrarMensaje("✅ Término agregado correctamente.");
    document.getElementById("formulario").reset();
    mostrarCampos();
  }
}

// ✅ Mostrar mensaje superior
function mostrarMensaje(texto) {
  const popup = document.getElementById("popupMsg");
  popup.innerHTML = texto;
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}
