// =========================================
// CONFIGURACIÓN GENERAL
// =========================================
const URL = 'https://script.google.com/macros/s/AKfycbys4Dq4jSXyKlERG8AwgpDAsT05sttX_73r0a9IgoXtMNMCzwT3QNMaZ6PVZpieIMEi/exec';
let glosario = {};
let db;
let glosarioCargado = false;
let debounceTimer;

// =========================================
// UTILIDADES
// =========================================
function toggleModo() {
  const isClaro = document.body.classList.toggle("light-mode");
  localStorage.setItem("modoClaro", isClaro ? "1" : "0");
}

function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

// =========================================
// INDEXEDDB
// =========================================
function abrirBaseDatos() {
  const request = indexedDB.open("DiccionarioAR", 1);
  request.onerror = () => console.error("❌ Error al abrir IndexedDB.");
  request.onsuccess = (event) => {
    db = event.target.result;
    cargarDesdeIndexedDB();
  };
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("terminos", { keyPath: "nombre" });
  };
}

function guardarEnIndexedDB(datos) {
  const tx = db.transaction("terminos", "readwrite");
  const store = tx.objectStore("terminos");
  for (let nombre in datos) {
    const claveNormalizada = normalizarTexto(nombre);
    const entrada = { ...datos[nombre], nombre: claveNormalizada };
    store.put(entrada);
  }
  tx.oncomplete = () => {
    glosarioCargado = true;
    actualizarContador();
  };
}

function cargarDesdeIndexedDB() {
  const tx = db.transaction("terminos", "readonly");
  const store = tx.objectStore("terminos");
  store.getAll().onsuccess = (event) => {
    const datos = event.target.result;
    if (datos.length > 0) {
      datos.forEach(e => {
        const clave = normalizarTexto(e.nombre);
        glosario[clave] = e;
      });
      glosarioCargado = true;
      actualizarContador();
    } else {
      cargarGlosario(true);
    }
  };
}

// =========================================
// GLOSARIO Y BUSCADOR
// =========================================
function cargarGlosario(guardarLocal = false) {
  fetch(URL).then(res => res.json()).then(data => {
    glosario = {};
    for (let nombre in data) {
      const clave = normalizarTexto(nombre);
      glosario[clave] = data[nombre];
    }
    if (guardarLocal && db) guardarEnIndexedDB(glosario);
    actualizarContador();
  }).catch(err => console.error("Error al cargar glosario:", err));
}

function actualizarGlosario() {
  if (navigator.onLine && db) {
    cargarGlosario(true);
    const ahora = new Date().toLocaleString();
    localStorage.setItem("ultimaActualizacion", ahora);
    document.getElementById("ultima-actualizacion").textContent = "Última actualización: " + ahora;
    alert("✅ Glosario actualizado con éxito.");
  } else {
    alert("⚠️ No hay conexión o base de datos no disponible.");
  }
}

function actualizarContador() {
  const total = Object.keys(glosario).length;
  const cont = document.getElementById("contadorTerminos");
  if (cont) cont.textContent = `Actualmente hay ${total} términos registrados.`;
}

function buscar() {
  if (!glosarioCargado) return;
  const terminoInput = document.getElementById("termino");
  const termino = normalizarTexto(terminoInput.value.trim());
  const resultado = document.getElementById("resultado");
  const spinner = document.getElementById("spinner");

  if (!termino) {
    resultado.innerText = "Por favor escribe un término.";
    return;
  }

  spinner.style.display = "block";
  setTimeout(() => spinner.style.display = "none", 500);

  let entrada = glosario[termino];
  let terminoReal = termino;

  if (!entrada) {
    for (let clave in glosario) {
      const valor = glosario[clave];
      if (valor["Traducción"] && normalizarTexto(valor["Traducción"]) === termino) {
        entrada = valor;
        terminoReal = clave;
        break;
      }
    }
  }

  resultado.classList.remove("animado");
  void resultado.offsetWidth;
  resultado.classList.add("animado");

  if (!entrada) {
    resultado.innerHTML = "⚠️ Término no encontrado.";
    const sugerencias = Object.keys(glosario).filter(key => {
      const normal = normalizarTexto(key);
      const val = glosario[key];
      const trad = val["Traducción"] ? normalizarTexto(val["Traducción"]) : "";
      return normal.includes(termino) || trad.includes(termino);
    });
    if (sugerencias.length > 0) {
      const sugerenciaHTML = sugerencias.slice(0, 3).map(s => `<button onclick="document.getElementById('termino').value='${s}';buscar();">${s}</button>`).join(" ");
      resultado.innerHTML += `<br><br><em>¿Quisiste decir?:</em><br><div class='sugerencias'>${sugerenciaHTML}</div>`;
    }
    return;
  }

  let html = `<div class="titulo-resultado">${terminoReal}</div>`;
  if ((entrada["Tipo"] || '').toLowerCase() === "abreviatura") {
    html += `<strong>Traducción:</strong><br><span class="italic">${entrada["Traducción"] || "-"}</span>`;
  } else {
    html += `<strong>Traducción:</strong> <span class="italic">${entrada["Traducción"] || "-"}</span><br>`;
    if (entrada["Pronunciación"]) html += `<strong>Pronunciación:</strong> <span class="pronunciacion">${entrada["Pronunciación"]}</span><br>`;
    if (entrada["Categoría"]) html += `<strong>Categoría:</strong> ${entrada["Categoría"]}<br>`;
    if (entrada["Definición"]) html += `<strong>Definición:</strong><br>${entrada["Definición"]}<br>`;
    if (entrada["Sinónimos"]) {
      const sin = entrada["Sinónimos"].split(",").map(s => `<span>${s.trim()}</span>`).join(" ");
      html += `<strong>Sinónimos:</strong><br><div class="sinonimos italic">${sin}</div>`;
    }
  }

  resultado.innerHTML = html;
}

function limpiarBusqueda() {
  document.getElementById("termino").value = "";
  document.getElementById("resultado").innerText = "Resultado aquí...";
}

// =========================================
// EVENTOS INICIALES
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
  }

  const ultima = localStorage.getItem("ultimaActualizacion") || "-";
  document.getElementById("ultima-actualizacion").textContent = "Última actualización: " + ultima;
  abrirBaseDatos();

  const frases = [
    "¿Qué deseas buscar hoy? 😊",
    "Descubre un nuevo término técnico 💡",
    "¿Qué significa ese símbolo raro? 🤔",
    "¡Explora el glosario! 📚",
    "Busca abreviaturas, formas, términos… 🧪"
  ];
  let index = 0;
  const input = document.getElementById("termino");

  setInterval(() => {
    input.setAttribute("placeholder", frases[index]);
    index = (index + 1) % frases.length;
  }, 4000);

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(buscar, 300);
  });

  window.addEventListener("load", () => {
    if (navigator.onLine && db) cargarGlosario(true);
  });
});

// =========================================
// SERVICE WORKER
// =========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => console.log('✅ SW registrado:', reg.scope))
      .catch(err => console.error('❌ Error SW:', err));
  });
}
