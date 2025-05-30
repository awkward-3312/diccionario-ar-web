// Activación de animaciones AOS
document.addEventListener("DOMContentLoaded", () => {
  // Aplica la animación de entrada
  document.body.classList.add("fade-in");

  // Inicializa AOS (Animate On Scroll)
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true
    });
  } else {
    console.warn("⚠️ AOS no está cargado correctamente.");
  }

  // Inicializa tooltips si tippy.js está disponible
  if (typeof tippy !== "undefined") {
    tippy("[data-tippy-content]", {
      animation: "shift-away",
      delay: [100, 0],
      arrow: true
    });
  }

  // Inicia los contadores si CountUp.js está disponible
  if (typeof countUp !== "undefined" && countUp.CountUp) {
    const opciones = {
      duration: 2,
      useEasing: true,
      separator: ","
    };

    const terminos = new countUp.CountUp("terminosContador", 350, opciones);
    const paises = new countUp.CountUp("paisesContador", 15, opciones);
    const visitas = new countUp.CountUp("visitasContador", 1200, opciones);

    if (!terminos.error) {
      terminos.start();
      paises.start();
      visitas.start();
    } else {
      console.warn("Error con CountUp:", terminos.error);
    }
  }
});

// Transición de salida animada al hacer clic en botones
function transicionar(url) {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}
