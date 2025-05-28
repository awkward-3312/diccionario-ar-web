document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chatForm");
  const textarea = document.getElementById("entradaTexto");
  const idioma = document.getElementById("idioma");
  const proveedor = document.getElementById("proveedor"); // nuevo
  const chatBox = document.getElementById("chatBox");
  const loader = document.getElementById("loader");

  function agregarMensaje(texto, clase) {
    const burbuja = document.createElement("div");
    burbuja.className = `mensaje ${clase}`;
    burbuja.textContent = texto;
    chatBox.appendChild(burbuja);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function mostrarLoader(mostrar) {
    loader.style.display = mostrar ? "block" : "none";
  }

  function leerEnVozAlta(texto, idiomaDestino) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = idiomaDestino;
    speechSynthesis.speak(utterance);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const texto = textarea.value.trim();
    const destino = idioma.value;
    const fuente = proveedor.value;

    if (!texto) {
      textarea.classList.add("texto-vacio");
      setTimeout(() => textarea.classList.remove("texto-vacio"), 600);
      return;
    }

    agregarMensaje(texto, "usuario");
    mostrarLoader(true);

    const endpoint =
      fuente === "deepl"
        ? "https://<TU-PROYECTO>.vercel.app/api/deepl" // ⚠️ Reemplaza con tu dominio
        : "https://traductor-backend.vercel.app/traducir";

    try {
      const respuesta = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto,
          idiomaDestino: destino
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        console.error("⛔ Backend respondió con error:", data);
        agregarMensaje("❌ Error del servidor al traducir.", "bot");
      } else if (data.traduccion) {
        agregarMensaje(data.traduccion, "bot");
        leerEnVozAlta(data.traduccion, destino);
      } else {
        agregarMensaje("⚠️ No se recibió una traducción válida.", "bot");
      }
    } catch (error) {
      console.error("Error al traducir:", error);
      agregarMensaje("⛔ Error al conectar con el servidor.", "bot");
    } finally {
      mostrarLoader(false);
      textarea.value = "";
    }
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
});
