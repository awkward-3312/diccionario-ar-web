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
    const transaccion = db.transaction(["terminos"], "readonly");
    const store = transaccion.objectStore("terminos");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
      glosario = {};
      getAll.result.forEach(entrada => {
        glosario[entrada.termino] = entrada;
      });
      glosarioCargado = true;
      actualizarContador();
    };
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("terminos", { keyPath: "termino" });
  };
}

function cargarGlosario() {
  fetch(URL)
    .then(res => res.json())
    .then(data => {
      glosario = data;
      if (db) {
        const transaccion = db.transaction(["terminos"], "readwrite");
        const store = transaccion.objectStore("terminos");
        store.clear();
        for (const termino in data) {
          const entrada = { termino, ...data[termino] };
          store.put(entrada);
        }
      }
      glosarioCargado = true;
      actualizarContador();
    })
    .catch(err => {
      console.error("Error al cargar glosario:", err);
      document.getElementById("estadoConexion").textContent = "⚠️ Error de conexión. Mostrando datos en caché.";
    });
}

function actualizarContador() {
  const contador = document.getElementById("contadorTerminos");
  const total = Object.keys(glosario).length;
  contador.textContent = `Términos disponibles: ${total}`;
}

function buscar() {
  const input = document.getElementById("termino").value.trim();
  const termino = normalizarTexto(input);
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  if (!termino) {
    resultadoDiv.innerHTML = "<p>Por favor escribe un término para buscar.</p>";
    return;
  }

  const resultados = [];

  for (const clave in glosario) {
    const entrada = glosario[clave];
    const claveNorm = normalizarTexto(clave);
    const espNorm = entrada.espanol ? normalizarTexto(entrada.espanol) : "";
    const ingNorm = entrada.ingles ? normalizarTexto(entrada.ingles) : "";

    if (
      claveNorm.includes(termino) ||
      espNorm.includes(termino) ||
      ingNorm.includes(termino)
    ) {
      resultados.push({ clave, entrada });
    }
  }

  if (resultados.length === 0) {
    resultadoDiv.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  resultados.forEach(({ clave, entrada }) => {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta-resultado");

    tarjeta.innerHTML = `
      <h2>${clave}</h2>
      ${entrada.espanol ? `<p><strong>Español:</strong> ${entrada.espanol}</p>` : ""}
      ${entrada.ingles ? `<p><strong>Inglés:</strong> ${entrada.ingles}</p>` : ""}
      ${entrada.pronunciacion ? `<p><strong>Pronunciación:</strong> ${entrada.pronunciacion}</p>` : ""}
      ${entrada.categoria ? `<p><strong>Categoría:</strong> ${entrada.categoria}</p>` : ""}
      ${entrada.definicion ? `<p><strong>Definición:</strong> ${entrada.definicion}</p>` : ""}
      ${entrada.sinonimos ? `<p><strong>Sinónimos:</strong> ${entrada.sinonimos}</p>` : ""}
    `;

    resultadoDiv.appendChild(tarjeta);
  });
}

function limpiarBusqueda() {
  document.getElementById("termino").value = "";
  document.getElementById("resultado").innerHTML = "Resultado aquí...";
}

function actualizarGlosario() {
  cargarGlosario();
  document.getElementById("notificacion").classList.remove("oculto");
  setTimeout(() => {
    document.getElementById("notificacion").classList.add("oculto");
  }, 3000);
}

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => console.log('✅ SW registrado:', reg.scope))
      .catch(err => console.warn('SW falló:', err));
  });
}

// ✅ Exportar funciones al scope global (crítico para index.html)
window.buscar = buscar;
window.limpiarBusqueda = limpiarBusqueda;
window.actualizarGlosario = actualizarGlosario;

// ✅ Iniciar carga de datos
abrirBaseDatos();
