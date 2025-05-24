const BACKEND_URL = "https://traductor-backend.vercel.app/traducir";

const form = document.getElementById("chatForm");
const entrada = document.getElementById("entradaTexto");
const idioma = document.getElementById("idioma");
const chatBox = document.getElementById("chatBox");
const fraseElemento = document.getElementById("frase-sparkie");

const frases = [
  "✨ ¡Eres brillante!",
  "💡 ¿Sabías que traducir ejercita el cerebro?",
  "🚀 ¡Vamos, que tú puedes con todo!",
  "🌟 Estoy aquí para ayudarte",
  "🧠 Traduce y fortalece tu mente",
  "🔤 Cada palabra cuenta, ¡sigue así!",
  "💬 ¡Dame un texto y lo traduzco en un destello!",
  "📘 Aprende algo nuevo cada día 😄"
];

function cambiarFrase() {
  if (!fraseElemento) return;
  const frase = frases[Math.floor(Math.random() * frases.length)];
  fraseElemento.textContent = frase;
}

setInterval(cambiarFrase, 5000);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = entrada.value.trim();
  const idiomaDestino = idioma.value;

  if (!texto || !idiomaDestino) return;

  agregarMensaje(texto, "usuario");
  entrada.value = "";
  entrada.disabled = true;
  idioma.disabled = true;

  try {
    const traduccion = await traducirTexto(texto, idiomaDestino);
    agregarMensaje(traduccion, "bot");
  } catch (error) {
    agregarMensaje("❌ Error al traducir. Intenta más tarde.", "bot");
    console.error("⛔ Error de traducción:", error.message);
  }

  entrada.disabled = false;
  idioma.disabled = false;
  entrada.focus();
});

function agregarMensaje(texto, clase) {
  const msg = document.createElement("div");
  msg.classList.add("mensaje", clase);
  msg.textContent = texto;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function traducirTexto(texto, idiomaDestino) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, idiomaDestino })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error del backend:", errorText);
      throw new Error("Respuesta inválida del servidor");
    }

    const data = await response.json();
    if (!data.traduccion) {
      throw new Error("Campo 'traduccion' no encontrado en la respuesta");
    }

    return data.traduccion;
  } catch (err) {
    console.error("⛔ Error capturado en traducirTexto:", err.message);
    throw err;
  }
}
