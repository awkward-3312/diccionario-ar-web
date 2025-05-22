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
      source: "auto",
      target: idioma,
      format: "text"
    });
  
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
  
    const endpoints = [
      "https://translate.astian.org/translate",
      "https://libretranslate.de/translate"
    ];
  
    let traducido = false;
  
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body
        });
  
        if (res.ok) {
          const data = await res.json();
          resultado.textContent = data.translatedText || "⚠️ Traducción vacía.";
          traducido = true;
          break;
        }
      } catch (err) {
        console.warn("Error con:", url, err);
      }
    }
  
    if (!traducido) {
      resultado.textContent = "❌ Error al traducir. Intenta más tarde.";
    }
  
    loader.style.display = "none";
  }
  