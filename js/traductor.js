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

  if (!texto) {
    resultado.textContent = "⚠️ Por favor ingresa un texto.";
    return;
  }

  loader.style.display = "block";
  resultado.textContent = "";

  const body = JSON.stringify({
    q: texto,
    target: idioma
  });

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  try {
    const res = await fetch("https://www.diccionario-ar.com/proxy-traductor.php", {
      method: "POST",
      headers,
      body
    });

    if (res.ok) {
      const data = await res.json();
      resultado.textContent = data.translatedText || "⚠️ Traducción vacía.";
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
