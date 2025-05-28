const URL = 'https://script.google.com/macros/s/AKfycbys4Dq4jSXyKlERG8AwgpDAsT05sttX_73r0a9IgoXtMNMCzwT3QNMaZ6PVZpieIMEi/exec';
let glosario = {};
let db;
let glosarioCargado = false;
let debounceTimer;

function toggleModo() {
  const isClaro = document.body.classList.toggle("light-mode");
  localStorage.setItem("modoClaro", isClaro ? "1" : "0");
}

function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

function abrirBaseDatos() {
  const request = indexedDB.open("DiccionarioAR", 1);

  request.onerror = () => {
    console.warn("⚠️ IndexedDB no disponible. Se cargará desde backend.");
    cargarGlosario();
    glosarioCargado = true;
  };

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
  if (!cont) return;

  cont.textContent = `Actualmente hay ${total} término${total !== 1 ? "s" : ""} registrados.`;

  let nuevos = 0;
  const ahora = new Date();
  const limite = new Date(ahora.getTime() - 8 * 60 * 60 * 1000); // últimas 8 horas

  for (const termino of Object.values(glosario)) {
    const fecha = termino["Fecha agregado"] || termino["fechaAgregado"] || "";
    const fechaObj = new Date(fecha);
    if (!isNaN(fechaObj) && fechaObj > limite) {
      nuevos++;
    }
  }

  const avisoExistente = document.getElementById("aviso-nuevos");
  if (avisoExistente) avisoExistente.remove();

  if (nuevos > 0) {
    const aviso = document.createElement("div");
    aviso.id = "aviso-nuevos";
    aviso.className = "aviso-nuevos";
    aviso.textContent = `📌 Se ha${nuevos > 1 ? 'n' : ''} agregado ${nuevos} término${nuevos !== 1 ? "s" : ""} en las últimas 8 horas.`;
    cont.after(aviso);
  }
}

function buscar() {
  if (!glosarioCargado) return;
  const terminoInput = document.getElementById("termino");
  const termino = terminoInput.value.trim().toUpperCase();
  const resultado = document.getElementById("resultado");
  const spinner = document.getElementById("spinner");

  if (!termino) {
    resultado.innerText = "Por favor escribe un término.";
    return;
  }

  spinner.style.display = "block";
  setTimeout(() => spinner.style.display = "none", 500);

  let entrada = glosario[termino];
  let terminoReal = entrada ? termino : null;

  resultado.classList.remove("animado");
  void resultado.offsetWidth;
  resultado.classList.add("animado");

  if (!entrada) {
    resultado.innerHTML = "⚠️ Término no encontrado.";
    const sugerencias = Object.keys(glosario).filter(key => {
      const normalClave = normalizarTexto(key);
      const trad = glosario[key]["Traducción"]
        ? normalizarTexto(glosario[key]["Traducción"])
        : "";
      const inputNormalizado = normalizarTexto(terminoInput.value.trim());
      return normalClave.includes(inputNormalizado) || trad.includes(inputNormalizado);
    });

    if (sugerencias.length > 0) {
      const sugerenciaHTML = sugerencias.slice(0, 3).map(s => {
        const original = glosario[s]["Traducción"] || s;
        return `<button onclick="document.getElementById('termino').value='${s}';buscar();">${original}</button>`;
      }).join(" ");
      resultado.innerHTML += `<br><br><em>¿Quisiste decir?:</em><br><div class='sugerencias'>${sugerenciaHTML}</div>`;
    }
    return;
  }

let html = `<div class="resultado-flex">`;

html += `<div class="bloque-texto">`;
html += `<div class="titulo-resultado">${terminoReal}</div>`;

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
html += `</div>`; // .bloque-texto

// Mostrar imagen a la derecha
if (
  entrada["Instrumento"] &&
  entrada["Instrumento"].normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() === "si" &&
  entrada["Imagen"]
) {
  html += `
    <div class="bloque-imagen">
      <img src="${entrada["Imagen"].trim()}" alt="Imagen del instrumento" class="imagen-instrumento">
    </div>
  `;
}

html += `</div>`; // .resultado-flex

resultado.innerHTML = html;
}

function limpiarBusqueda() {
  document.getElementById("termino").value = "";
  document.getElementById("resultado").innerText = "Resultado aquí...";
}

document.addEventListener("DOMContentLoaded", () => {
  const actualizarBtn = document.getElementById("actualizarBtn");
  if (actualizarBtn) {
    actualizarBtn.disabled = true;
    const esperarDB = setInterval(() => {
      if (glosarioCargado) {
        actualizarBtn.disabled = false;
        actualizarBtn.addEventListener("click", actualizarGlosario);
        clearInterval(esperarDB);
      }
    }, 200);
  }

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

  document.getElementById("btnBuscar")?.addEventListener("click", buscar);
  document.getElementById("btnLimpiar")?.addEventListener("click", limpiarBusqueda);
  document.getElementById("btnActualizar")?.addEventListener("click", actualizarGlosario);
  
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

  // SPARKIE: Ícono flotante + burbuja sugerencia
  const sparkieBtn = document.createElement("div");
  sparkieBtn.id = "sparkie-boton";
  sparkieBtn.title = "Habla con Sparkie";
  sparkieBtn.innerHTML = `
    <img src="img/sparkie.png" alt="Sparkie">
    <div id="sparkie-burbuja" class="oculto">¿Tienes dudas? ¡Habla con Sparkie!</div>
  `;
  document.body.appendChild(sparkieBtn);

  sparkieBtn.addEventListener("click", () => {
    window.location.href = "chat-sparkie.html";
  });

  setInterval(() => {
    const burbuja = document.getElementById("sparkie-burbuja");
    burbuja.classList.remove("oculto");
    setTimeout(() => burbuja.classList.add("oculto"), 4000);
  }, 20000);
}); // ⬅️ ESTA ES LA LLAVE QUE FALTABA

// ✅ Fuera del DOMContentLoaded
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => console.log('✅ SW registrado:', reg.scope))
      .catch(err => console.error('❌ Error SW:', err));
  });
}
