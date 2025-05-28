// === chat-sparkie.js ===
document.addEventListener("DOMContentLoaded", () => {
  const chat = document.getElementById("chat");
  const form = document.getElementById("formulario");
  const input = document.getElementById("pregunta");
  const sonido = document.getElementById("sparkie-sound");
  const btnSonido = document.getElementById("toggle-sonido");
  const btnTema = document.getElementById("toggle-tema");
  const btnRegresar = document.getElementById("btn-regresar");

  let threadId = sessionStorage.getItem("sparkie_thread");
  let sonidoActivado = sessionStorage.getItem("sonidoActivado") !== "0";
  let temaOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;

  document.body.classList.toggle("dark-mode", temaOscuro);
  btnSonido.textContent = sonidoActivado ? "🔊" : "🔇";

  function agregarMensaje(texto, clase) {
    const mensaje = document.createElement("div");
    mensaje.className = `mensaje ${clase}`;

    const avatar = document.createElement("img");
    avatar.src = clase === "sparkie" ? "img/user1.png" : "img/user2.png";
    avatar.className = "avatar";

    const burbuja = document.createElement("div");
    burbuja.className = "burbuja";
    burbuja.textContent = texto;

    mensaje.appendChild(avatar);
    mensaje.appendChild(burbuja);
    chat.appendChild(mensaje);
    chat.scrollTop = chat.scrollHeight;
  }

  function mostrarPensando() {
    const mensaje = document.createElement("div");
    mensaje.className = "mensaje sparkie";
    mensaje.id = "pensando";

    const avatar = document.createElement("img");
    avatar.src = "img/user1.png";
    avatar.className = "avatar";

    const burbuja = document.createElement("div");
    burbuja.className = "burbuja pensando";
    burbuja.textContent = "Sparkie está pensando";

    mensaje.appendChild(avatar);
    mensaje.appendChild(burbuja);
    chat.appendChild(mensaje);
    chat.scrollTop = chat.scrollHeight;
  }

  function eliminarPensando() {
    const pensando = document.getElementById("pensando");
    if (pensando) pensando.remove();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;

    agregarMensaje(texto, "usuario");
    input.value = "";
    mostrarPensando();

    try {
      const payload = { mensajeUsuario: texto };
      if (threadId) payload.threadId = threadId;

      console.log("📤 Enviando a Sparkie:", payload);

      const res = await fetch("https://sparkie-backend.vercel.app/api/sparkie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      eliminarPensando();

      if (!res.ok) {
        console.warn("⚠️ Respuesta no OK:", res.status);
        agregarMensaje("❌ Error al contactar a Sparkie.", "sparkie");
        return;
      }

      const data = await res.json();
      console.log("✅ Respuesta de Sparkie:", data);

      if (data.respuesta && typeof data.respuesta === "string") {
        agregarMensaje(data.respuesta, "sparkie");
        if (sonidoActivado) {
          sonido.currentTime = 0;
          sonido.play();
        }
        threadId = data.threadId;
        sessionStorage.setItem("sparkie_thread", threadId);
      } else {
        agregarMensaje("⚠️ Respuesta no válida de Sparkie.", "sparkie");
      }
    } catch (err) {
      eliminarPensando();
      console.error("[Sparkie ERROR]", err);
      agregarMensaje("🌐 Error de red o conexión interrumpida.", "sparkie");
    }
  });

  btnSonido.addEventListener("click", () => {
    sonidoActivado = !sonidoActivado;
    sessionStorage.setItem("sonidoActivado", sonidoActivado ? "1" : "0");
    btnSonido.textContent = sonidoActivado ? "🔊" : "🔇";
  });

  btnTema.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });

  btnRegresar.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
