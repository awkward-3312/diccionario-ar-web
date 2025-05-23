const BACKEND_URL = "https://traductor-backend.onrender.com/traducir";

const form = document.getElementById("chatForm");
const entrada = document.getElementById("entradaTexto");
const chatBox = document.getElementById("chatBox");
const fraseElemento = document.getElementById("frase-sparkie");

// 🟡 Frases que Sparkie mostrará cada 5 segundos
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
  if (!texto) return;

  agregarMensaje(texto, "usuario");
  entrada.value = "";
  entrada.disabled = true;

  try {
    const traduccion = await traducirDeepL(texto);
    agregarMensaje(traduccion, "bot");
  } catch (error) {
    agregarMensaje("❌ Error al traducir. Intenta más tarde.", "bot");
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto, targetLang: "EN" }) // Cambia "EN" por otro idioma si lo deseas
  });

  if (!response.ok) throw new Error("Error en el servidor");

  const data = await response.json();
  return data.traduccion;
}
