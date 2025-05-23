const BACKEND_URL = "https://traductor-backend.onrender.com/traducir";

const form = document.getElementById("chatForm");
const entrada = document.getElementById("entradaTexto");
const chatBox = document.getElementById("chatBox");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = entrada.value.trim();
  if (!texto) return;

  agregarMensaje(texto, "usuario");
  entrada.value = "";
  entrada.disabled = true;

  try {
    const traduccion = await traducirDeepL(texto);
    agregarMensaje(traduccion, "bot");
  } catch (error) {
    agregarMensaje("❌ Error al traducir.", "bot");
    console.error(error);
  }

  entrada.disabled = false;
  entrada.focus();
});

function agregarMensaje(texto, clase) {
  const msg = document.createElement("div");
  msg.classList.add("mensaje", clase);
  msg.textContent = texto;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function traducirDeepL(texto) {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      texto: texto,
      targetLang: "EN"  // puedes cambiar a "ES", "FR", etc.
    })
  });

  if (!response.ok) throw new Error("Error en la API");

  const data = await response.json();
  return data.traduccion;
}
