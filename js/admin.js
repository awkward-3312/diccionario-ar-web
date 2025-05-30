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
    .order('Fecha agregado', { ascending: false });
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
      <td>${fila.Término || ""}</td>
      <td>${fila.Traducción || ""}</td>
      <td>${fila.Pronunciación || ""}</td>
      <td>${fila.Categoría || ""}</td>
      <td>${fila.Definición || ""}</td>
      <td>${fila.Sinónimos || ""}</td>
      <td>${fila["Tipo de término"] || ""}</td>
      <td>${fila["Forma farmacéutica"] || ""}</td>
      <td>${fila.Imagen ? `<a href="${fila.Imagen}" target="_blank">Ver</a>` : ""}</td>
      <td>${fila["Fecha agregado"] ? new Date(fila["Fecha agregado"]).toLocaleDateString() : "-"}</td>
      <td>
        <button onclick="editarFila(${fila.id})">✏️</button>
        <button onclick="eliminarFila(${fila.id})">🗑️</button>
      </td>`;
    todasLasFilas.push(tr);
  });

  mostrarPagina(1);
}

// === PAGINACIÓN ===
function mostrarPagina(pagina) {
  paginaActual = pagina;
  tbody.innerHTML = "";
  const inicio = (pagina - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const filasMostrar = todasLasFilas.slice(inicio, fin);
  filasMostrar.forEach(f => tbody.appendChild(f));
  generarPaginacion();
}

function generarPaginacion() {
  const totalPaginas = Math.ceil(todasLasFilas.length / filasPorPagina);
  const paginacion = document.getElementById("paginacion");
  paginacion.innerHTML = "";

  const mostrarRango = 3; // cantidad de páginas visibles
  const inicio = Math.max(1, paginaActual - 1);
  const fin = Math.min(totalPaginas, inicio + mostrarRango - 1);

  if (paginaActual > 1) {
    const btnInicio = document.createElement("button");
    btnInicio.textContent = "Inicio";
    btnInicio.onclick = () => mostrarPagina(1);
    paginacion.appendChild(btnInicio);
  }

  const btnAnterior = document.createElement("button");
  btnAnterior.innerHTML = "<";
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.onclick = () => mostrarPagina(paginaActual - 1);
  paginacion.appendChild(btnAnterior);

  for (let i = inicio; i <= fin; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => mostrarPagina(i);
    if (i === paginaActual) {
      btn.style.backgroundColor = "#3ae374";
      btn.style.color = "black";
    }
    paginacion.appendChild(btn);
  }

  const btnSiguiente = document.createElement("button");
  btnSiguiente.innerHTML = ">";
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.onclick = () => mostrarPagina(paginaActual + 1);
  paginacion.appendChild(btnSiguiente);

  if (paginaActual < totalPaginas) {
    const btnFinal = document.createElement("button");
    btnFinal.textContent = "Final";
    btnFinal.onclick = () => mostrarPagina(totalPaginas);
    paginacion.appendChild(btnFinal);
  }
}

// === EDITAR ===
async function editarFila(id) {
  const fila = datosCrudos.find(d => d.id === id);
  if (!fila) return alert("ID no encontrado");

  function limpiar(input, valorAnterior) {
    if (input === null || input.trim() === "" || input.trim() === "null") return valorAnterior || null;
    return input.trim();
  }

  const actualizado = {
    Término: limpiar(prompt("Término:", fila.Término), fila.Término),
    Traducción: limpiar(prompt("Traducción:", fila.Traducción), fila.Traducción),
    Pronunciación: limpiar(prompt("Pronunciación:", fila.Pronunciación), fila.Pronunciación),
    Categoría: limpiar(prompt("Categoría:", fila.Categoría), fila.Categoría),
    Definición: limpiar(prompt("Definición:", fila.Definición), fila.Definición),
    Sinónimos: limpiar(prompt("Sinónimos:", fila.Sinónimos), fila.Sinónimos),
    ["Tipo de término"]: limpiar(prompt("Tipo de término:", fila["Tipo de término"]), fila["Tipo de término"]),
    ["Forma farmacéutica"]: limpiar(prompt("Forma farmacéutica:", fila["Forma farmacéutica"]), fila["Forma farmacéutica"]),
    Imagen: limpiar(prompt("URL de la imagen:", fila.Imagen), fila.Imagen),
    ["Fecha agregado"]: new Date().toISOString()
  };

  mostrarLoader();
  const { data, error, count } = await client
    .from('base_datos')
    .update(actualizado)
    .eq('id', id)
    .select(); // <- permite ver si actualizó algo
  ocultarLoader();

  if (error) {
    mostrarPopup("❌ Error al editar", false);
    console.error(error);
  } else if (!data || data.length === 0) {
    mostrarPopup("⚠️ No se realizaron cambios. Revisa si modificaste algo.", false);
  } else {
    mostrarPopup("✅ Término actualizado exitosamente.");
    cargarDatos();
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
    mostrarPopup("❌ Error al eliminar");
    console.error(error);
  } else {
    mostrarPopup("🗑️ Término eliminado correctamente.");
    cargarDatos();
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

// === ALERTA EMERGENTE ===
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
