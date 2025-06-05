document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chatBox');
  const form = document.getElementById('chatForm');
  const textarea = document.getElementById('entradaTexto');
  const idioma = document.getElementById('idioma');
  const proveedorSelect = document.getElementById('proveedor');
  const btnTema = document.getElementById('toggle-tema');
  const btnSonido = document.getElementById('toggle-sonido');
  const btnRegresar = document.getElementById('btn-regresar');
  const sonido = document.getElementById('notificacion');

  const USE_MOCK = new URLSearchParams(location.search).get('mock') === '1';
  const BASE_URL = location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://traductor-backend.vercel.app';

  let sonidoActivo = localStorage.getItem('traductor_sonido') !== '0';
  let darkMode = localStorage.getItem('traductor_tema');
  if (!darkMode) {
    darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.body.classList.toggle('dark-mode', darkMode === 'dark');
  actualizarIconos();

  function actualizarIconos() {
    btnSonido.innerHTML = sonidoActivo ? '<i class="fas fa-volume-high"></i>' : '<i class="fas fa-volume-xmark"></i>';
  }

  function scrollAbajo() {
    chat.scrollTop = chat.scrollHeight;
  }

  function agregarMensaje(texto, clase) {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje ${clase}`;

    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = clase === 'usuario' ? 'img/user2.png' : 'img/user1.png';
    avatar.alt = clase === 'usuario' ? 'Usuario' : 'Sparkie';

    const burbuja = document.createElement('div');
    burbuja.className = 'burbuja';
    burbuja.textContent = texto;

    mensaje.append(avatar, burbuja);
    chat.appendChild(mensaje);
    scrollAbajo();
  }

  function agregarBurbuja(texto, clase) {
    agregarMensaje(texto, clase);
  }

  function mostrarPensando() {
    const mensaje = document.createElement('div');
    mensaje.className = 'mensaje sparkie';
    mensaje.id = 'pensando';

    const avatar = document.createElement('img');
    avatar.src = 'img/user1.png';
    avatar.className = 'avatar';
    avatar.alt = 'Sparkie';

    const burbuja = document.createElement('div');
    burbuja.className = 'burbuja pensando';
    burbuja.textContent = 'Traduciendo';

    mensaje.append(avatar, burbuja);
    chat.appendChild(mensaje);
    scrollAbajo();
  }

  function eliminarPensando() {
    const pensando = document.getElementById('pensando');
    if (pensando) pensando.remove();
  }

  btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const tema = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('traductor_tema', tema);
  });

  btnSonido.addEventListener('click', () => {
    sonidoActivo = !sonidoActivo;
    localStorage.setItem('traductor_sonido', sonidoActivo ? '1' : '0');
    actualizarIconos();
  });

  btnRegresar.addEventListener('click', () => {
    window.history.back();
  });

  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit(); // ✅ método moderno que evita warning
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const texto = textarea.value.trim();
    if (!texto) return;

    agregarBurbuja(texto, 'usuario');
    textarea.value = '';
    mostrarPensando();

    try {
      let proveedor = proveedorSelect.value.trim().toLowerCase();
      if (!['deepl', 'traducir'].includes(proveedor)) proveedor = 'traducir';
      const endpoint = `${BASE_URL}/api/${proveedor}`;

      let data;
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 300));
        data = { traduccion: `[${idioma.value}] ${texto}` };
      } else {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: texto })
        });
        if (!res.ok) {
          eliminarPensando();
          agregarBurbuja('Error al traducir.', 'sparkie');
          return;
        }
        data = await res.json();
      }

      eliminarPensando();
      if (data.traduccion) {
        agregarBurbuja(data.traduccion, 'sparkie');
        if (sonidoActivo) {
          sonido.currentTime = 0;
          sonido.play();
        }
      } else {
        agregarBurbuja('No se recibió una traducción válida.', 'sparkie');
      }
    } catch (err) {
      eliminarPensando();
      agregarBurbuja('Error de conexión.', 'sparkie');
    }
  });
});
