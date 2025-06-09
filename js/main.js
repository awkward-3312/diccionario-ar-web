const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
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
    mostrarNotificacion("No hay conexión o base de datos disponible.");
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

  const entrada = Object.values(glosario).find(item => {
    const t = normalizarTexto(item.termino || "");
    const tr = normalizarTexto(item.traduccion || "");
    return t === termino || tr === termino;
  });
  const terminoReal = entrada?.termino || null;

  resultado.classList.remove("animado");
  void resultado.offsetWidth;
  resultado.classList.add("animado");

  if (!entrada) {
    resultado.innerHTML = "<i class='fas fa-exclamation-circle'></i> Término no encontrado.";

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

  // Mostrar término original en el input
  document.getElementById("termino").value = entrada.termino || terminoReal;

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
  html += `</div>`; // .bloque-texto

  if ((entrada.tipo_termino || "").toLowerCase() === "instrumento" && entrada.imagen) {
    const urlImagen = entrada.imagen.startsWith("http")
      ? entrada.imagen
      : `https://gapivzjnehrkbbnjtvam.supabase.co/storage/v1/object/public/instrumentos/${entrada.imagen.trim()}`;

    html += `
      <div class="bloque-imagen">
        <img src="${urlImagen}" alt="Imagen del instrumento" class="imagen-instrumento" />
      </div>
    `;
  }

  html += `</div>`; // .resultado-flex
  resultado.innerHTML = html;
}

async function enviarSugerenciaTermino() {
  const texto = document.getElementById("sugerencia-input").value.trim();
  const apodo = document.getElementById("apodo-input").value.trim();
  const mensaje = document.getElementById("mensaje-sugerencia");
  if (!texto || !ultimaBusqueda) {
    mensaje.innerHTML = "<div class='error'><i class='fas fa-exclamation-triangle'></i> Escribe una sugerencia válida.</div>";
    return;
  }
  const fecha = new Date().toISOString();
  const { error } = await supabase.from("sugerencias").insert([{
    termino: ultimaBusqueda,
    sugerencia: texto,
    apodo: apodo || null,
    estado: "pendiente",
    fecha_sugerida: fecha
  }]);
  if (error) {
    console.error(error);
    mensaje.innerHTML = "<div class='error'><i class='fas fa-times-circle'></i> Error al enviar sugerencia.</div>";
  } else {
    mensaje.innerHTML = "<div class='mensaje'><i class='fas fa-check-circle'></i> ¡Gracias por tu sugerencia!</div>";
    document.getElementById("sugerencia-input").value = "";
    document.getElementById("apodo-input").value = "";
    setTimeout(() => {
      document.getElementById("ventana-sugerencia").classList.add("oculto");
      mensaje.innerHTML = "";
    }, 2500);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  abrirBaseDatos();
  document.getElementById("btnBuscar")?.addEventListener("click", buscar);
  document.getElementById("termino")?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(buscar, 200);
  });
  document.getElementById("termino")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscar();
    }
  });
  document.getElementById("btnLimpiar")?.addEventListener("click", () => {
    document.getElementById("termino").value = "";
    document.getElementById("resultado").innerText = "Resultado aquí...";
  });
  document.getElementById("btnActualizar")?.addEventListener("click", actualizarGlosario);
  document.getElementById("btn-sugerir")?.addEventListener("click", () => {
    if (!ultimaBusqueda) {
      alert("Busca un término antes de sugerir.");
      return;
    }
    document.getElementById("ventana-sugerencia").classList.remove("oculto");
  });
  document.getElementById("cerrar-sugerencia")?.addEventListener("click", () => {
    document.getElementById("ventana-sugerencia").classList.add("oculto");
  });
  document.getElementById("enviar-sugerencia")?.addEventListener("click", enviarSugerenciaTermino);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("ventana-sugerencia")?.classList.add("oculto");
    }
  });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js')
    .then(reg => {
      console.log('✅ Service Worker registrado', reg);
      monitorServiceWorker(reg);
    })
    .catch(err => console.error('❌ Error al registrar SW', err));
}

function monitorServiceWorker(reg) {
  if (!reg) return;

  function showUpdateBanner() {
    if (document.getElementById('update-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.background = '#333';
    banner.style.color = '#fff';
    banner.style.padding = '10px';
    banner.style.display = 'flex';
    banner.style.justifyContent = 'center';
    banner.style.alignItems = 'center';
    banner.style.zIndex = '1000';

    const texto = document.createElement('span');
    texto.textContent = 'A new version is available.';

    const btn = document.createElement('button');
    btn.textContent = 'Click to update';
    btn.style.marginLeft = '10px';
    btn.addEventListener('click', () => {
      banner.remove();
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        reg.waiting.addEventListener('statechange', e => {
          if (e.target.state === 'activated') {
            window.location.reload();
          }
        });
      }
    });

    banner.appendChild(texto);
    banner.appendChild(btn);
    document.body.appendChild(banner);
  }

  if (reg.waiting) {
    showUpdateBanner();
  }

  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner();
        }
      });
    }
  });

  reg.update();
}

window.buscar = buscar;
window.actualizarGlosario = actualizarGlosario;





function mostrarResultado(nombre) {
  const entrada = glosario[normalizarTexto(nombre)];
  if (!entrada) return;

  const resultadoDiv = document.getElementById("resultado");
  const sugerenciaDiv = document.getElementById("sugerencias");

  const { traduccion, pronunciacion, categoria, definicion, sinonimos, tipo_termino, instrumentos } = entrada;

  ultimaBusqueda = nombre;

  resultadoDiv.innerHTML = `
    <div class="titulo-resultado">${nombre}</div>
    ${traduccion ? `<p class="traduccion"><strong>Traducción:</strong> ${traduccion}</p>` : ""}
    ${pronunciacion ? `<p class="pronunciacion"><strong>Pronunciación:</strong> ${pronunciacion}</p>` : ""}
    ${categoria ? `<p class="categoria"><strong>Categoría:</strong> ${categoria}</p>` : ""}
    ${definicion ? `<p class="definicion"><strong>Definición:</strong> ${definicion}</p>` : ""}
    ${sinonimos ? `<div class="sinonimos"><strong>Sinónimos:</strong> ${sinonimos}</div>` : ""}
    ${tipo_termino ? `<p class="tipo"><strong>Tipo:</strong> ${tipo_termino}</p>` : ""}
    ${instrumentos ? `<img src="img/instrumentos/${instrumentos}.png" alt="${instrumentos}" class="imagen-instrumento">` : ""}
  `;

  if (sugerenciaDiv) sugerenciaDiv.innerHTML = "";
}
    
