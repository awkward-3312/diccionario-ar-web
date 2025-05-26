document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chatForm");
  const textarea = document.getElementById("entradaTexto");
  const idioma = document.getElementById("idioma");
  const chatBox = document.getElementById("chatBox");
  const loader = document.getElementById("loader");

  // ✅ Función para agregar burbuja al chat
  function agregarMensaje(texto, clase) {
    const burbuja = document.createElement("div");
    burbuja.className = `mensaje ${clase}`;
    burbuja.textContent = texto;
    chatBox.appendChild(burbuja);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // ✅ Función para mostrar/ocultar loader Sparkie
  function mostrarLoader(mostrar) {
    loader.style.display = mostrar ? "block" : "none";
  }

  // ✅ Función para leer en voz alta
  function leerEnVozAlta(texto, idiomaDestino) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = idiomaDestino;
    speechSynthesis.speak(utterance);
  }

  // ✅ Evento: enviar formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const texto = textarea.value.trim();
    const destino = idioma.value;

    if (!texto) {
      textarea.classList.add("texto-vacio");
      setTimeout(() => textarea.classList.remove("texto-vacio"), 600);
      return;
    }

    agregarMensaje(texto, "usuario");
    mostrarLoader(true);

    try {
      const respuesta = await fetch("https://traductor-backend.vercel.app/traducir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, destino })
      });

      const data = await respuesta.json();

      if (data.traduccion) {
        agregarMensaje(data.traduccion, "bot");
        leerEnVozAlta(data.traduccion, destino);
      } else {
        agregarMensaje("❌ No se pudo traducir el texto.", "bot");
      }
    } catch (error) {
      console.error("Error al traducir:", error);
      agregarMensaje("⛔ Error al conectar con el servidor.", "bot");
    } finally {
      mostrarLoader(false);
      textarea.value = "";
    }
  });

  // ✅ Atajo: enter traduce si no se mantiene shift
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
});
