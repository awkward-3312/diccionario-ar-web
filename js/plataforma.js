// Alterna entre modo claro y oscuro en la sección de plataforma
function toggleModo() {
  const esClaro = document.body.classList.toggle('light-mode');
  localStorage.setItem('modoClaro', esClaro ? '1' : '0');
}

// Aplica una transición antes de redirigir
function transicionar(url) {
  document.body.classList.remove('fade-in');
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 300);
}

// Configuración general de animaciones y scroll al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('modoClaro') === '1') {
    document.body.classList.add('light-mode');
  }
  if (window.AOS) AOS.init({ once: true });
  document.body.classList.add('fade-in');

  const btnTop = document.getElementById('btn-top'); // 🔹 Botón scroll arriba
  if (btnTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) btnTop.classList.add('show');
      else btnTop.classList.remove('show');
    });
    btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const sparkie = document.getElementById('sparkie'); // 🔹 Mascota interactiva
  const tip = document.getElementById('sparkie-tip');
  if (sparkie && tip) {
    sparkie.addEventListener('mouseenter', () => { tip.style.display = 'block'; });
    sparkie.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  }
});

window.transicionar = transicionar;
