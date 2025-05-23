const API_KEY = "3e5c31fd-9125-47b6-bbdd-d6f157125d60:fx";

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
  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `DeepL-Auth-Key ${API_KEY}`
    },
    body: new URLSearchParams({
      text: texto,
      target_lang: "EN" // puedes cambiar a "ES", "FR", etc.
    })
  });

  if (!response.ok) throw new Error("Error en la API");

  const data = await response.json();
  return data.translations[0].text;
}
