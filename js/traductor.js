function toggleModo() {
  const isClaro = document.body.classList.toggle("light-mode");
  localStorage.setItem("modoClaro", isClaro ? "1" : "0");
}

if (localStorage.getItem("modoClaro") === "1") {
  document.body.classList.add("light-mode");
}

async function traducirTexto() {
  const texto = document.getElementById("textoOriginal").value.trim();
  const idioma = document.getElementById("idiomaDestino").value;
  const resultado = document.getElementById("resultadoTraduccion");
  const loader = document.getElementById("loader");
  const copiarBtn = document.getElementById("btnCopiar");

  if (!texto) {
    resultado.textContent = "⚠️ Por favor ingresa un texto.";
    copiarBtn.style.display = "none";
    return;
  }

  loader.style.display = "block";
  resultado.textContent = "";
  copiarBtn.style.display = "none";

  const body = JSON.stringify({
    q: texto,
    target: idioma
    // source: "auto" se usa por defecto desde el backend
  });

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  try {
    const res = await fetch("https://proxy-traductor-node.onrender.com/translate", {
      method: "POST",
      headers,
      body
    });

    if (res.ok) {
      const data = await res.json();
      resultado.textContent = data.translatedText || "⚠️ Traducción vacía.";
      if (data.translatedText) copiarBtn.style.display = "inline-block";
    } else {
      resultado.textContent = "❌ Error al traducir. Intenta más tarde.";
    }
  } catch (err) {
    resultado.textContent = "❌ Error de red. Verifica la conexión.";
    console.error(err);
  } finally {
    loader.style.display = "none";
  }
}

function copiarTraduccion() {
  const resultado = document.getElementById("resultadoTraduccion").textContent;
  if (resultado) {
    navigator.clipboard.writeText(resultado).then(() => {
      alert("✅ Traducción copiada al portapapeles");
    });
  }
}

function limpiarCampos() {
  document.getElementById("textoOriginal").value = "";
  document.getElementById("resultadoTraduccion").textContent = "";
  document.getElementById("btnCopiar").style.display = "none";
}

console.log("✅ traductor.js cargado correctamente");
