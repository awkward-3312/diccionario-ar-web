// SHA-256 hashing
async function hashClave(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const CLAVE_HASH = "e176a4d6700f098d168d271fd4edd0c9363fb3cd4b89c03620cd297690750618";
const API_URL = 'https://script.google.com/macros/s/AKfycbys4Dq4jSXyKlERG8AwgpDAsT05sttX_73r0a9IgoXtMNMCzwT3QNMaZ6PVZpieIMEi/exec';
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
  const clave = document.getElementById("clave").value.trim();
  const hashIngresado = await hashClave(clave);

  if (hashIngresado === CLAVE_HASH) {
    localStorage.setItem("adminAutenticado", "true");
    mostrarPanel();
  } else {
    alert("Contraseña incorrecta");
    document.getElementById("clave").value = "";
  }
}

function mostrarPanel() {
  document.getElementById("loginPanel").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  document.getElementById("btnSugerencias").style.display = "block";
  const btnCerrar = document.getElementById("btnCerrarSesion");
  if (btnCerrar) btnCerrar.style.display = "inline-block";
  cargarDatos();
}

function cerrarSesion() {
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

function cargarDatos() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      todasLasFilas = [];
      datosCrudos = [];

      for (const id in data) {
        const fila = data[id];
        const termino = fila["Término"] || fila["termino"] || "(Sin término)";
        const tr = document.createElement("tr");
        tr.dataset.id = fila.id || id;

        tr.innerHTML = `
          <td>${fila.id || id}</td>
          <td>${termino}</td>
          <td>${fila["Traducción"] || ""}</td>
          <td>${fila["Pronunciación"] || ""}</td>
          <td>${fila["Categoría"] || ""}</td>
          <td>${fila["Definición"] || ""}</td>
          <td>${fila["Sinónimos"] || ""}</td>
          <td>${fila["Tipo"] || ""}</td>
          <td>${fila["Forma farmacéutica"] || ""}</td>
          <td>${fila["Instrumento"] || ""}</td>
          <td>${fila["Imagen"] ? `<a href="${fila["Imagen"]}" target="_blank">Ver</a>` : ""}</td>
          <td>${fila["fecha_agregado"] || "-"}</td>`;

        const editarBtn = `<button onclick="editarFila(this)">✏️</button>`;
        const eliminarBtn = `<button onclick="eliminarFila(this)">🗑️</button>`;
        tr.innerHTML += `<td>${editarBtn} ${eliminarBtn}</td>`;

        todasLasFilas.push(tr);
        datosCrudos.push({ id: fila.id || id, termino, ...fila });
      }

      mostrarPagina(1);
    })
    .catch(err => {
      tbody.innerHTML = `<tr><td colspan='13'>❌ Error al cargar los términos.</td></tr>`;
      console.error("Error cargando términos:", err);
    });
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
  btnAnterior.onclick = () => {
    if (paginaActual > 1) {
      mostrarPagina(paginaActual - 1);
    }
  };
  paginacion.appendChild(btnAnterior);

  let inicio = Math.max(1, paginaActual - 1);
  let fin = Math.min(totalPaginas, paginaActual + 1);
  if (paginaActual >= totalPaginas - 1) {
    inicio = totalPaginas - 2;
    fin = totalPaginas;
  }
  if (inicio < 1) inicio = 1;

  for (let i = inicio; i <= fin; i++) {
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
  btnSiguiente.onclick = () => {
    if (paginaActual < totalPaginas) {
      mostrarPagina(paginaActual + 1);
    }
  };
  paginacion.appendChild(btnSiguiente);
}

function editarFila(boton) {
  const fila = boton.closest("tr");
  const id = fila.dataset.id;
  const dato = datosCrudos.find(d => `${d.id}`.trim() === `${id}`.trim());
  if (!dato) return alert("ID no encontrado");

  const actualizado = {
    id,
    termino: prompt("Término:", dato.termino) || dato.termino,
    traduccion: prompt("Traducción:", dato["Traducción"]) || dato["Traducción"],
    pronunciacion: prompt("Pronunciación:", dato["Pronunciación"]) || dato["Pronunciación"],
    categoria: prompt("Categoría:", dato["Categoría"]) || dato["Categoría"],
    definicion: prompt("Definición:", dato["Definición"]) || dato["Definición"],
    sinonimos: prompt("Sinónimos:", dato["Sinónimos"]) || dato["Sinónimos"],
    tipo: prompt("Tipo:", dato["Tipo"]) || dato["Tipo"],
    formaFarmaceutica: prompt("Forma farmacéutica:", dato["Forma farmacéutica"]) || dato["Forma farmacéutica"]
  };

  fetch(API_URL, {
    method: 'POST',
    body: new URLSearchParams({ actualizar: true, ...actualizado }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  .then(() => cargarDatos())
  .catch(err => console.error("❌ Error al editar:", err));
}

function eliminarFila(boton) {
  const fila = boton.closest("tr");
  const id = fila.dataset.id;
  if (!confirm("¿Seguro que deseas eliminar este término?")) return;

  fetch(API_URL, {
    method: 'POST',
    body: new URLSearchParams({ eliminar: true, id }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  .then(() => cargarDatos())
  .catch(err => console.error("❌ Error al eliminar:", err));
}

function filtrarTabla() {
  const filtro = document.getElementById("buscador").value.toLowerCase();
  const filasFiltradas = todasLasFilas.filter(fila => {
    const texto = fila.innerText.toLowerCase();
    return texto.includes(filtro);
  });
  tbody.innerHTML = "";
  filasFiltradas.slice(0, filasPorPagina).forEach(f => tbody.appendChild(f));
}
