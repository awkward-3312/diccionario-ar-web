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
  
    try {
      const res = await fetch("https://translate.astian.org/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          q: texto,
          source: "auto",
          target: idioma,
          format: "text"
        })
      });
  
      const data = await res.json();
      resultado.textContent = data.translatedText || "⚠️ No se pudo traducir.";
    } catch (err) {
      resultado.textContent = "❌ Error al traducir.";
      console.error(err);
    } finally {
      loader.style.display = "none";
    }
  }
  