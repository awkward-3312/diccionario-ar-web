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
  const termino = terminoInput.value.trim().toUpperCase(); // buscar solo en inglés
  const resultado = document.getElementById("resultado");
  const spinner = document.getElementById("spinner");

  if (!termino) {
    resultado.innerText = "Por favor escribe un término.";
    return;
  }

  spinner.style.display = "block";
  setTimeout(() => spinner.style.display = "none", 500);

  let entrada = glosario[termino]; // clave exacta en inglés
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
    if (
      entrada["Instrumento"] &&
      entrada["Instrumento"].normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() === "si" &&
      entrada["Imagen"]
    ) {
      html += `<br><img src="${entrada["Imagen"].trim()}" alt="Imagen del instrumento" class="imagen-instrumento">`;
    }       

  resultado.innerHTML = html;
}

function limpiarBusqueda() {
  document.getElementById("termino").value = "";
  document.getElementById("resultado").innerText = "Resultado aquí...";
}

document.addEventListener("DOMContentLoaded", () => {

  const actualizarBtn = document.getElementById("actualizarBtn");
  if (actualizarBtn) {
    actualizarBtn.addEventListener("click", actualizarGlosario);
  }

  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
  }
  const ultima = localStorage.getItem("ultimaActualizacion") || "-";
  document.getElementById("ultima-actualizacion").textContent = "Última actualización: " + ultima;
  abrirBaseDatos();

  // Frases dinámicas para el input
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => console.log('✅ SW registrado:', reg.scope))
      .catch(err => console.error('❌ Error SW:', err));
  });
}
}