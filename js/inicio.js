document.addEventListener("DOMContentLoaded", () => {
  // Transición inicial de carga
  document.body.classList.add("fade-in");
  
  // AOS para animaciones al hacer scroll
  AOS.init({
    once: true,
    duration: 800,
    easing: 'ease-out-cubic'
  });

  // Transiciones suaves entre páginas
  const links = document.querySelectorAll(".link-transicion");
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const destino = link.getAttribute("href");
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");
      setTimeout(() => window.location.href = destino, 300);
    });
  });
});
