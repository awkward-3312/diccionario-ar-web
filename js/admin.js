// === CONFIGURACIÓN SUPABASE ===
const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let todasLasFilas = [];
let datosCrudos = [];
let paginaActual = 1;
const filasPorPagina = 15;
const tbody = document.querySelector("#tablaTerminos tbody");

function toggleMostrar() {
  const input = document.getElementById("clave");
  const boton = document.querySelector(".mostrar-toggle");
  const mostrar = input.type === "password";
  input.type = mostrar ? "text" : "password";
  boton.textContent = mostrar ? "OCULTAR" : "MOSTRAR";
}

async function verificarClave() {
  const correo = document.getElementById("correo").value.trim();
  const clave = document.getElementById("clave").value;

  const { data, error } = await supabase.auth.signInWithPassword({
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

function mostrarPanel() {
  document.getElementById("loginPanel").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("btnSugerencias").style.display = "block";
  const btnCerrar = document.getElementById("btnCerrarSesion");
  if (btnCerrar) btnCerrar.style.display = "inline-block";
  cargarDatos();
}

async function cerrarSesion() {
  await supabase.auth.signOut();
  localStorage.removeItem("adminAutenticado");
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
  }
  if (localStorage.getItem("adminAutenticado") === "true") {
    mostrarPanel();
  }
});

async function cargarDatos() {
  const { data, error } = await supabase
    .from('base_datos')
    .select('*')
    .order('Fecha Agregado', { ascending: false });

  if (error) {
    console.error("Error al cargar los términos:", error);
    tbody.innerHTML = `<tr><td colspan='13'>❌ Error al cargar los términos.</td></tr>`;
    return;
  }

  todasLasFilas = [];
  datosCrudos = data;

  data.forEach((fila, index) => {
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
      <td>${fila["Tipo de termino"] || ""}</td>
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

  const btnAnterior = document.createElement("button");
  btnAnterior.innerHTML = "&lt;";
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.onclick = () => mostrarPagina(paginaActual - 1);
  paginacion.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style.margin = "0 3px";
    btn.onclick = () => mostrarPagina(i);
    if (i === paginaActual) {
      btn.style.backgroundColor = "#3ae374";
      btn.style.color = "black";
    }
    paginacion.appendChild(btn);
  }

  const btnSiguiente = document.createElement("button");
  btnSiguiente.innerHTML = "&gt;";
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.onclick = () => mostrarPagina(paginaActual + 1);
  paginacion.appendChild(btnSiguiente);
}

async function editarFila(id) {
  const fila = datosCrudos.find(d => d.id === id);
  if (!fila) return alert("ID no encontrado");

  const actualizado = {
    Término: prompt("Término:", fila.Término) || fila.Término,
    Traducción: prompt("Traducción:", fila.Traducción) || fila.Traducción,
    Pronunciación: prompt("Pronunciación:", fila.Pronunciación) || fila.Pronunciación,
    Categoría: prompt("Categoría:", fila.Categoría) || fila.Categoría,
    Definición: prompt("Definición:", fila.Definición) || fila.Definición,
    Sinónimos: prompt("Sinónimos:", fila.Sinónimos) || fila.Sinónimos,
    ["Tipo de termino"]: prompt("Tipo de término:", fila["Tipo de termino"]) || fila["Tipo de termino"],
    ["Forma farmacéutica"]: prompt("Forma farmacéutica:", fila["Forma farmacéutica"]) || fila["Forma farmacéutica"],
    Imagen: prompt("URL de la imagen:", fila.Imagen) || fila.Imagen,
    ["Fecha Agregado"]: new Date().toISOString()
  };

  const { error } = await supabase
    .from('base_datos')
    .update(actualizado)
    .eq('id', id);

  if (error) {
    alert("❌ Error al editar");
    console.error(error);
  } else {
    cargarDatos();
  }
}

async function eliminarFila(id) {
  if (!confirm("¿Seguro que deseas eliminar este término?")) return;

  const { error } = await supabase
    .from('base_datos')
    .delete()
    .eq('id', id);

  if (error) {
    alert("❌ Error al eliminar");
    console.error(error);
  } else {
    cargarDatos();
  }
}

function filtrarTabla() {
  const filtro = document.getElementById("buscador").value.toLowerCase();
  const filasFiltradas = todasLasFilas.filter(fila => fila.innerText.toLowerCase().includes(filtro));
  tbody.innerHTML = "";
  filasFiltradas.slice(0, filasPorPagina).forEach(f => tbody.appendChild(f));
}
