// === chat-sparkie.js ===
const chat = document.getElementById('chat');
const form = document.getElementById('formulario');
const input = document.getElementById('pregunta');
const sonido = document.getElementById('sparkie-sound');
const btnSonido = document.getElementById('toggle-sonido');
const btnTema = document.getElementById('toggle-tema');

let threadId = sessionStorage.getItem('sparkie_thread');
let sonidoActivado = sessionStorage.getItem('sonidoActivado') !== '0';
let temaOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;

document.body.classList.toggle('dark-mode', temaOscuro);

function agregarMensaje(texto, clase) {
  const mensaje = document.createElement('div');
  mensaje.className = `mensaje ${clase}`;

  const avatar = document.createElement('img');
  avatar.src = clase === 'sparkie' ? 'img/sparkie.png' : 'img/user.png';
  avatar.className = 'avatar';

  const burbuja = document.createElement('div');
  burbuja.className = 'burbuja';
  burbuja.textContent = texto;

  mensaje.appendChild(avatar);
  mensaje.appendChild(burbuja);
  chat.appendChild(mensaje);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarPensando() {
  const mensaje = document.createElement('div');
  mensaje.className = 'mensaje sparkie';
  mensaje.id = 'pensando';

  const avatar = document.createElement('img');
  avatar.src = 'img/sparkie.png';
  avatar.className = 'avatar';

  const burbuja = document.createElement('div');
  burbuja.className = 'burbuja pensando';
  burbuja.textContent = 'Sparkie está pensando...';

  mensaje.appendChild(avatar);
  mensaje.appendChild(burbuja);
  chat.appendChild(mensaje);
  chat.scrollTop = chat.scrollHeight;
}

function eliminarPensando() {
  const pensando = document.getElementById('pensando');
  if (pensando) pensando.remove();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = input.value.trim();
  if (!texto) return;

  agregarMensaje(texto, 'usuario');
  input.value = '';
  mostrarPensando();

  try {
    const res = await fetch('https://sparkie-backend.vercel.app/api/sparkie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensajeUsuario: texto, threadId })
    });

    const data = await res.json();
    eliminarPensando();

    if (data.respuesta) {
      agregarMensaje(data.respuesta, 'sparkie');
      if (sonidoActivado) {
        sonido.currentTime = 0;
        sonido.play();
      }
      threadId = data.threadId;
      sessionStorage.setItem('sparkie_thread', threadId);
    } else {
      agregarMensaje('Lo siento, ocurrió un error 🧠', 'sparkie');
    }
  } catch (err) {
    eliminarPensando();
    agregarMensaje('Error de conexión con Sparkie.', 'sparkie');
    console.error(err);
  }
});

btnSonido.addEventListener('click', () => {
  sonidoActivado = !sonidoActivado;
  sessionStorage.setItem('sonidoActivado', sonidoActivado ? '1' : '0');
  btnSonido.textContent = sonidoActivado ? '🔊' : '🔇';
});

btnTema.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

btnSonido.textContent = sonidoActivado ? '🔊' : '🔇';

document.getElementById('btn-regresar').addEventListener('click', () => {
  window.location.href = 'index.html';
});
