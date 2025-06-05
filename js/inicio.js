function toggleModo() {
  const esClaro = document.body.classList.toggle('light-mode');
  localStorage.setItem('modoClaro', esClaro ? '1' : '0');
}

function transicionar(url) {
  document.body.classList.remove('fade-in');
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('modoClaro') === '1') {
    document.body.classList.add('light-mode');
  }
  if (window.AOS) AOS.init({ once: true });
});

window.transicionar = transicionar;
