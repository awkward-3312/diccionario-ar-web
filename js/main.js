const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // acorta si lo publicas
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let glosario = {};
let db;
let glosarioCargado = false;
let debounceTimer;
let ultimaBusqueda = null;

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

async function cargarGlosario(guardarLocal = false) {
  const { data, error } = await supabase.from('base_datos').select('*');
  if (error) {
    console.error("❌ Error al cargar desde Supabase:", error);
    return;
  }

  glosario = {};
  data.forEach(item => {
    const clave = normalizarTexto(item["termino"]);
    glosario[clave] = item;
  });

  if (guardarLocal && db) guardarEnIndexedDB(glosario);
  actualizarContador();
}

function actualizarContador() {
  const total = Object.keys(glosario).length;
  const contenedor = document.getElementById("contadorTerminos");
  if (!contenedor) return;

  let nuevos = 0;
  const ahora = new Date();
  const limite = new Date(ahora.getTime() - 8 * 60 * 60 * 1000);

  for (const termino of Object.values(glosario)) {
    let fechaTexto = termino["fecha_agregado"] || "";
    if (fechaTexto) {
      const fechaObj = new Date(fechaTexto);
      if (!isNaN(fechaObj)) {
        if (fechaObj > limite) nuevos++;
      }
    }
  }

  const textoBase = `Actualmente hay ${total} término${total !== 1 ? "s" : ""} registrados.`;
  const textoNuevos = nuevos > 0 ? ` 📌 Se ha${nuevos > 1 ? "n" : ""} agregado ${nuevos} término${nuevos !== 1 ? "s" : ""} en las últimas 8 horas.` : "";

  contenedor.textContent = textoBase + textoNuevos;
}

function buscar() {
  if (!glosarioCargado) return;
  const terminoInput = document.getElementById("termino");
  const inputUsuario = terminoInput.value.trim();
  const termino = normalizarTexto(inputUsuario);
  const resultado = document.getElementById("resultado");
  const spinner = document.getElementById("spinner");

  if (!termino) {
    resultado.innerText = "Por favor escribe un término.";
    return;
  }

  spinner.style.display = "block";
  setTimeout(() => spinner.style.display = "none", 500);

  let entrada = null;
  let terminoReal = null;

  for (const key in glosario) {
    const item = glosario[key];
    const normalizadoTermino = normalizarTexto(item.termino || "");
    const normalizadoTraduccion = normalizarTexto(item.traduccion || "");

    if (normalizadoTermino === termino || normalizadoTraduccion === termino) {
      entrada = item;
      terminoReal = item.termino;
      break;
    }
  }

  resultado.classList.remove("animado");
  void resultado.offsetWidth;
  resultado.classList.add("animado");

  if (!entrada) {
    resultado.innerHTML = "⚠️ Término no encontrado.";

    const sugerencias = Object.values(glosario).filter(e => {
      const t = normalizarTexto(e.termino || "");
      const tr = normalizarTexto(e.traduccion || "");
      return t.includes(termino) || tr.includes(termino);
    });

    if (sugerencias.length > 0) {
      const sugerenciaHTML = sugerencias.slice(0, 3).map(e => {
        const visible = e.termino || e.traduccion || "Sin nombre";
        return `<button onclick="document.getElementById('termino').value='${visible}';buscar();">${visible}</button>`;
      }).join(" ");
      resultado.innerHTML += `<br><br><em>¿Quisiste decir?:</em><br><div class='sugerencias'>${sugerenciaHTML}</div>`;
    }

    return;
  }

  document.getElementById("termino").value = entrada.termino || terminoReal;
  ultimaBusqueda = entrada.termino || terminoReal;

  let html = `<div class="resultado-flex">`;
  html += `<div class="bloque-texto">`;
  html += `<div class="titulo-resultado">${entrada.termino || terminoReal}</div>`;

  if ((entrada.tipo_termino || "").toLowerCase() === "abreviatura") {
    html += `<p><strong>Traducción:</strong><br><span class="italic">${entrada.traduccion || "-"}</span></p>`;
  } else {
    if (entrada.traduccion) html += `<p><strong>Traducción:</strong> <span class="italic">${entrada.traduccion}</span></p>`;
    if (entrada.pronunciacion) html += `<p><strong>Pronunciación:</strong> <span class="italic">${entrada.pronunciacion}</span></p>`;
    if (entrada.categoria) html += `<p><strong>Categoría:</strong> ${entrada.categoria}</p>`;
    if (entrada.definicion) html += `<p><strong>Definición:</strong><br>${entrada.definicion}</p>`;
    if (entrada.sinonimos) {
      const sin = entrada.sinonimos.split(",").map(s => `<span class="etiqueta">${s.trim()}</span>`).join(" ");
      html += `<p><strong>Sinónimos:</strong><br><div class="sinonimos">${sin}</div></p>`;
    }
  }

  html += `</div></div>`;
  resultado.innerHTML = html;
}

window.buscar = buscar;
window.limpiarBusqueda = () => {
  document.getElementById("termino").value = "";
  document.getElementById("resultado").innerText = "Resultado aquí...";
};
window.actualizarGlosario = actualizarGlosario;
