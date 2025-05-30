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

  // Siempre ocultar todos primero
  const campos = ["traduccion", "pronunciacion", "categoria", "definicion", "sinonimos", "formaFarmaceutica"];
  campos.forEach(id => document.getElementById(id)?.style && (document.getElementById(id).style.display = "none"));

  if (tipo === "abreviatura") {
    document.getElementById("traduccion").style.display = "block";
  } else if (tipo === "termino") {
    document.getElementById("traduccion").style.display = "block";
    document.getElementById("pronunciacion").style.display = "block";
    document.getElementById("categoria").style.display = "block";
    document.getElementById("definicion").style.display = "block";
    document.getElementById("sinonimos").style.display = "block";
  } else if (tipo === "forma") {
    document.getElementById("definicion").style.display = "block";
    document.getElementById("formaFarmaceutica").style.display = "block";
  } else if (tipo === "instrumento") {
    document.getElementById("traduccion").style.display = "block";
    document.getElementById("pronunciacion").style.display = "block";
    document.getElementById("categoria").style.display = "block";
    document.getElementById("definicion").style.display = "block";
    document.getElementById("sinonimos").style.display = "block";
  }
}

// ✅ Guardar término en Supabase
async function guardarTermino(e) {
  e.preventDefault();

  const loader = document.getElementById("loader");
  loader.style.display = "block";

  const termino = document.getElementById("termino").value.trim();
  let tipo = document.getElementById("tipo").value;
  const traduccion = document.getElementById("traduccion").value.trim();
  const pronunciacion = document.getElementById("pronunciacion").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const definicion = document.getElementById("definicion").value.trim();
  const sinonimos = document.getElementById("sinonimos").value.trim();
  const formaFarmaceutica = document.getElementById("formaFarmaceutica")?.value || null;

  // Autoasignar tipo
  if (tipo === "termino") tipo = "Término";
  if (tipo === "forma") tipo = "Forma farmacéutica";
  if (tipo === "instrumento") tipo = "Instrumento";

  if (!termino || !tipo) {
    mostrarMensaje("❌ Faltan campos obligatorios");
    loader.style.display = "none";
    return;
  }

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

  const nuevoTermino = {
    Término: termino,
    Tipo: tipo,
    Traducción: traduccion || null,
    Pronunciación: pronunciacion || null,
    Categoría: categoria || null,
    Definición: definicion || null,
    Sinónimos: sinonimos || null,
    Forma: formaFarmaceutica || null,
    fecha_agregado: new Date().toISOString()
  };

  const { error } = await supabase
    .from('base_datos')
    .insert([nuevoTermino]);

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

function mostrarMensaje(texto) {
  const popup = document.getElementById("popupMsg");
  popup.textContent = texto;
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}
