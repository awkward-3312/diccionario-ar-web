// contacto.js

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector(".formulario-contacto");
  
    formulario.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const mensaje = document.getElementById("mensaje").value.trim();
  
      if (!nombre || !email || !mensaje) {
        alert("Por favor, completa todos los campos.");
        return;
      }
  
      // Simular envío con mensaje de confirmación
      alert("✅ ¡Gracias por tu mensaje! Nos pondremos en contacto pronto.");
  
      // Opcional: limpiar formulario
      formulario.reset();
    });
  });