// === CONFIGURACIÓN SUPABASE ===
const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
const client = window.supabase.createClient(supabaseUrl, supabaseKey);

let todasLasFilas = [];
let datosCrudos = [];
let paginaActual = 1;
const filasPorPagina = 15;
let tbody;

// === LOADER ===
function mostrarLoader() {
  document.getElementById("loader").style.display = "block";
}
function ocultarLoader() {
  document.getElementById("loader").style.display = "none";
}

// === MODO CLARO OSCURO Y CARGA INICIAL ===
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
  }
  tbody = document.querySelector("#tablaTerminos tbody");
  if (localStorage.getItem("adminAutenticado") === "true") {
    mostrarPanel();
  }

  const form = document.getElementById("formLogin");
  form?.addEventListener("submit", function (e) {
    e.preventDefault();
    verificarClave();
  });
});

// === MOSTRAR CONTRASEÑA ===
function toggleMostrar() {
  const input = document.getElementById("clave");
  const boton = document.querySelector(".mostrar-toggle");
  const mostrar = input.type === "password";
  input.type = mostrar ? "text" : "password";
  boton.textContent = mostrar ? "OCULTAR" : "MOSTRAR";
}

// === AUTENTICACIÓN ===
async function verificarClave() {
  const correo = document.getElementById("correo").value.trim();
  const clave = document.getElementById("clave").value;

  const { data, error } = await client.auth.signInWithPassword({
    email: correo,
    password: clave
  });

  if (error || !data.session) {
    alert("❌ Usuario o contraseña incorrectos.");
    document.getElementById("clave").value = "";
    return;
  }

  localStorage.setItem("adminAutenticado", "true");
  mostrarPanel();
}

async function cerrarSesion() {
  await client.auth.signOut();
  localStorage.removeItem("adminAutenticado");
  location.reload();
}

function mostrarPanel() {
  document.getElementById("loginPanel").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("btnSugerencias").style.display = "block";
  const btnCerrar = document.getElementById("btnCerrarSesion");
  if (btnCerrar) btnCerrar.style.display = "inline-block";
  cargarDatos();
}

// === CARGAR TERMINOS ===
async function cargarDatos() {
  mostrarLoader();
  const { data, error } = await client
    .from('base_datos')
    .select('*')
    .order('id', { ascending: false });
  ocultarLoader();

  if (error) {
    console.error("Error al cargar los términos:", error);
    if (tbody) tbody.innerHTML = `<tr><td colspan='13'>❌ Error al cargar los términos.</td></tr>`;
    return;
  }

  todasLasFilas = [];
  datosCrudos = data;

  data.forEach(fila => {
    const tr = document.createElement("tr");
    tr.dataset.id = fila.id;
    tr.innerHTML = `
      <td>${fila.id}</td>
      <td>${fila.termino || ""}</td>
      <td>${fila.traduccion || ""}</td>
      <td>${fila.pronunciacion || ""}</td>
      <td>${fila.categoria || ""}</td>
      <td>${fila.definicion || ""}</td>
      <td>${fila.sinonimos || ""}</td>
      <td>${fila.tipo_termino || ""}</td>
      <td>${fila.forma_farmaceutica || ""}</td>
      <td>${fila.imagen ? `<a href="${fila.imagen}" target="_blank">Ver</a>` : ""}</td>
      <td>${fila.fecha_agregado ? new Date(fila.fecha_agregado).toLocaleDateString() : "-"}</td>
      <td>
        <button onclick="editarFila(${fila.id})">✏️</button>
        <button onclick="eliminarFila(${fila.id})">🗑️</button>
      </td>`;
    todasLasFilas.push(tr);
  });

  mostrarPagina(1);
}

// === PAGINACIÓN ===
function mostrarPagina(numero) {
  paginaActual = numero;
  const inicio = (numero - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const paginaFilas = todasLasFilas.slice(inicio, fin);

  tbody.innerHTML = "";
  paginaFilas.forEach(f => tbody.appendChild(f));

  const paginacion = document.getElementById("paginacion");
  paginacion.innerHTML = "";

  const totalPaginas = Math.ceil(todasLasFilas.length / filasPorPagina);
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === paginaActual;
    btn.onclick = () => mostrarPagina(i);
    paginacion.appendChild(btn);
  }
}

// === EDITAR ===
async function editarFila(id) {
  const fila = datosCrudos.find(d => d.id === id);
  if (!fila) return alert("ID no encontrado");

  const actualizado = {
    termino: prompt("Término:", fila.termino) || fila.termino,
    traduccion: prompt("Traducción:", fila.traduccion) || fila.traduccion,
    pronunciacion: prompt("Pronunciación:", fila.pronunciacion) || fila.pronunciacion,
    categoria: prompt("Categoría:", fila.categoria) || fila.categoria,
    definicion: prompt("Definición:", fila.definicion) || fila.definicion,
    sinonimos: prompt("Sinónimos:", fila.sinonimos) || fila.sinonimos,
    tipo_termino: prompt("Tipo de término:", fila.tipo_termino) || fila.tipo_termino,
    forma_farmaceutica: prompt("Forma farmacéutica:", fila.forma_farmaceutica) || fila.forma_farmaceutica,
    imagen: prompt("URL de la imagen:", fila.imagen) || fila.imagen,
    fecha_agregado: new Date().toISOString()
  };

  mostrarLoader();
  const { data, error } = await client
    .from('base_datos')
    .update(actualizado)
    .eq('id', id)
    .select();
  ocultarLoader();

  if (error) {
    mostrarPopup("❌ Error al editar", false);
    console.error(error);
  } else if (!data || data.length === 0) {
    mostrarPopup("⚠️ No se realizaron cambios.", false);
  } else {
    mostrarPopup("✅ Término actualizado exitosamente.");
    await cargarDatos();
    mostrarPagina(paginaActual);
  }
}

// === ELIMINAR ===
async function eliminarFila(id) {
  if (!confirm("¿Seguro que deseas eliminar este término?")) return;

  mostrarLoader();
  const { error } = await client
    .from('base_datos')
    .delete()
    .eq('id', id);
  ocultarLoader();

  if (error) {
    mostrarPopup("❌ Error al eliminar", false);
    console.error(error);
  } else {
    mostrarPopup("🗑️ Término eliminado correctamente.");
    await cargarDatos();
    mostrarPagina(paginaActual);
  }
}

// === FILTRAR ===
function filtrarTabla() {
  const filtro = document.getElementById("buscador").value.toLowerCase();
  const filasFiltradas = todasLasFilas.filter(fila =>
    fila.innerText.toLowerCase().includes(filtro)
  );
  tbody.innerHTML = "";
  filasFiltradas.slice(0, filasPorPagina).forEach(f => tbody.appendChild(f));
}

// === ALERTA EMERGENTE COMO EN agregar.js ===
function mostrarPopup(mensaje, exito = true) {
  const popup = document.createElement("div");
  popup.textContent = mensaje;
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.padding = "15px 25px";
  popup.style.backgroundColor = exito ? "#3ae374" : "#ff5c39";
  popup.style.color = "#111";
  popup.style.fontWeight = "bold";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  popup.style.zIndex = "9999";
  popup.style.transition = "opacity 0.3s ease";
  popup.style.opacity = "1";

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 300);
  }, 2500);
}
