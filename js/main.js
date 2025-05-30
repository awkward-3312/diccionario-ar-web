const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
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

async function cargarGlosario(guardarLocal = false) {
  const { data, error } = await supabase
    .from('base_datos')
    .select('*');

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

function mostrarNotificacion(mensaje) {
  const popup = document.getElementById("popupNotificacion");
  const texto = document.getElementById("popupTexto");

  if (popup && texto) {
    texto.textContent = mensaje;
    popup.classList.remove("oculto");
    setTimeout(() => popup.classList.add("oculto"), 3000);
  }
}

function actualizarGlosario() {
  if (navigator.onLine && db) {
    cargarGlosario(true);
    const ahora = new Date().toLocaleString();
    localStorage.setItem("ultimaActualizacion", ahora);
    document.getElementById("ultima-actualizacion").textContent = "Última actualización: " + ahora;
    mostrarNotificacion("Glosario actualizado con éxito.");
  } else {
    mostrarNotificacion("⚠️ No hay conexión o base de datos disponible.");
  }
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
  
  if (!entrada) {
    for (const key in glosario) {
      const item = glosario[key];
      const normalizadoTraduccion = normalizarTexto(item.traduccion || item["Traducción"] || "");
      const normalizadoTermino = normalizarTexto(item.termino || item["Término"] || "");
      if (normalizadoTermino === termino || normalizadoTraduccion === termino) {
        entrada = item;
        terminoReal = key;
        break;
      }
    }    
  }  
  
  // Mostrar nombre visible en campo de búsqueda
  if (entrada) {
    const nombreVisible = entrada["termino"] || terminoReal;
    document.getElementById("termino").value = nombreVisible;
  }  

  resultado.classList.remove("animado");
  void resultado.offsetWidth;
  resultado.classList.add("animado");

  if (!entrada) {
    resultado.innerHTML = "⚠️ Término no encontrado.";
    const inputNormalizado = normalizarTexto(terminoInput.value.trim());
    const sugerencias = Object.keys(glosario).filter(key => {
      const claveNorm = normalizarTexto(key);
      const tradNorm = normalizarTexto(glosario[key]["Traducción"] || "");
      return (
        claveNorm.includes(inputNormalizado) ||
        tradNorm.includes(inputNormalizado)
      );
    });    

    if (sugerencias.length > 0) {
      const sugerenciaHTML = sugerencias.slice(0, 3).map(s => {
        const original = glosario[s]["traduccion"] || s;
        return `<button onclick="document.getElementById('termino').value='${s}';buscar();">${original}</button>`;
      }).join(" ");
      resultado.innerHTML += `<br><br><em>¿Quisiste decir?:</em><br><div class='sugerencias'>${sugerenciaHTML}</div>`;
    }
    return;
  }

let html = `<div class="resultado-flex">`;

html += `<div class="bloque-texto">`;
html += `<div class="titulo-resultado">${entrada["Término"] || entrada["termino"] || terminoReal}</div>`;

if ((entrada["Tipo"] || '').toLowerCase() === "abreviatura") {
  html += `<strong>Traducción:</strong><br><span class="italic">${entrada["traduccion"] || "-"}</span>`;
} else {
  html += `<strong>Traducción:</strong> <span class="italic">${entrada["Traducción"] || "-"}</span><br>`;
  if (entrada.pronunciacion || entrada["Pronunciación"]) {
    html += `<strong>Pronunciación:</strong> <span class="italic">${entrada.pronunciacion || entrada["Pronunciación"]}</span><br>`;
  }
  
  if (entrada.categoria || entrada["Categoría"]) {
    html += `<strong>Categoría:</strong> ${entrada.categoria || entrada["Categoría"]}<br>`;
  }
  
  if (entrada.definicion || entrada["Definición"]) {
    html += `<strong>Definición:</strong><br>${entrada.definicion || entrada["Definición"]}<br>`;
  }
  
  if (entrada.sinonimos) {
    const sin = entrada.sinonimos.split(",").map(s => `<span>${s.trim()}</span>`).join(" ");
    html += `<strong>Sinónimos:</strong><br><div class="sinonimos italic">${sin}</div>`;
  }  
}
html += `</div>`; // .bloque-texto

// Mostrar imagen a la derecha
const tipo = (entrada.tipo_termino || entrada["tipo_termino"] || "").toLowerCase();
const imagen = entrada.imagen || entrada["imagen"];

if (tipo === "instrumento" && imagen) {
  const nombreArchivo = imagen.trim();
  const urlImagen = nombreArchivo.startsWith("http")
    ? nombreArchivo
    : `https://gapivzjnehrkbbnjtvam.supabase.co/storage/v1/object/public/instrumentos/${nombreArchivo}`;

  html += `
    <div class="bloque-imagen">
      <img src="${urlImagen}" alt="Imagen del instrumento" class="imagen-instrumento">
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
  // Activar modo claro si está guardado
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
    document.getElementById("icono-modo").className = "fas fa-sun";
  }

  // Mostrar fecha de última actualización
  const ultima = localStorage.getItem("ultimaActualizacion") || "-";
  document.getElementById("ultima-actualizacion").textContent = "Última actualización: " + ultima;

  abrirBaseDatos();

  // Enlazar botones correctamente
  const btnBuscar = document.getElementById("btnBuscar");
  const btnLimpiar = document.getElementById("btnLimpiar");
  const btnActualizar = document.getElementById("btnActualizar");

  if (btnBuscar) btnBuscar.addEventListener("click", buscar);
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarBusqueda);

  if (btnActualizar) {
    btnActualizar.disabled = true;
    const esperarDB = setInterval(() => {
      if (glosarioCargado) {
        btnActualizar.disabled = false;
        btnActualizar.addEventListener("click", actualizarGlosario);
        clearInterval(esperarDB);
      }
    }, 200);
  }

  // Placeholder dinámico
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

  // Mostrar sugerencias sin activar búsqueda automática
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const termino = input.value.trim().toUpperCase();
      const resultado = document.getElementById("resultado");

      if (!termino) {
        resultado.innerText = "Resultado aquí...";
        return;
      }

      const sugerencias = Object.keys(glosario).filter(key => {
        const claveNorm = normalizarTexto(key);
        const tradNorm = normalizarTexto(glosario[key]["Traducción"] || "");
        const inputNorm = normalizarTexto(termino);
        return claveNorm.includes(inputNorm) || tradNorm.includes(inputNorm);
      });

      if (sugerencias.length > 0) {
        const sugerenciaHTML = sugerencias.slice(0, 5).map(s => {
          const original = glosario[s]["Término"] || glosario[s]["Traducción"] || s;
          return `<button onclick="document.getElementById('termino').value='${s}';buscar();">${original}</button>`;
        }).join(" ");
        resultado.innerHTML = `<em>¿Quisiste decir?:</em><br><div class='sugerencias'>${sugerenciaHTML}</div>`;
      } else {
        resultado.innerHTML = "⚠️ Término no encontrado.";
      }
    }, 300);
  });

  // Sparkie botón flotante
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

  // Recarga glosario desde Supabase si hay conexión
  window.addEventListener("load", () => {
    if (navigator.onLine && db) cargarGlosario(true);
  });
});

// ✅ Fuera del DOMContentLoaded
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => console.log('✅ SW registrado:', reg.scope))
      .catch(err => console.error('❌ Error SW:', err));
  });
}

window.buscar = buscar;
window.limpiarBusqueda = limpiarBusqueda;
window.actualizarGlosario = actualizarGlosario;
