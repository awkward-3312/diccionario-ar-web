// Alterna entre modo claro y oscuro en la portada
function toggleModo() {
  const esClaro = document.body.classList.toggle('light-mode');
  localStorage.setItem('modoClaro', esClaro ? '1' : '0');
}

// Aplica una breve animación antes de cambiar de página
function transicionar(url) {
  document.body.classList.remove('fade-in');
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 300);
}

// Configura animaciones y botón de volver al inicio al cargar
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('modoClaro') === '1') {
    document.body.classList.add('light-mode');
  }
  if (window.AOS) AOS.init({ once: true });

  const backBtn = document.getElementById('back-to-top'); // 🔹 Scroll al inicio
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('show', window.scrollY > 300);
    });
  }
});

window.transicionar = transicionar;
