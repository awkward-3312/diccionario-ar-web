document.addEventListener("DOMContentLoaded", () => {
    console.log("Inicio cargado correctamente ✨");
  
    // Desplazamiento suave si agregas secciones con anclas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  
    // Aquí podrías añadir animaciones o efectos en el futuro
  });
  