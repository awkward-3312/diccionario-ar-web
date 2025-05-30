const URL_SUGERENCIAS = "https://script.google.com/macros/s/AKfycbxZj7zbD0onrR8VNRj90WkOb5c_zZn_1TJfOWw74Dkr_alVru65XgLj08mT3AjHZPao/exec";

function enviarSugerencia() {
  const texto = document.getElementById("sugerencia").value.trim();
  const mensaje = document.getElementById("mensaje");

  if (!texto) {
    mensaje.innerHTML = '<div class="error">⚠️ Por favor escribe una sugerencia antes de enviar.</div>';
    return;
  }

  const datos = new URLSearchParams();
  datos.append("sugerencia", texto);

  fetch(URL_SUGERENCIAS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: datos.toString()
  })
  .then(res => res.ok ? res.text() : Promise.reject(res.statusText))
  .then(() => {
    mensaje.innerHTML = '<div class="mensaje">💌 Tu sugerencia ha sido enviada exitosamente. <span class="corazon">❤️</span><br>Agradecemos tus sugerencias para mejorar la plataforma.</div>';
    document.getElementById("sugerencia").value = "";
  })
  .catch(err => {
    mensaje.innerHTML = '<div class="error">❌ Error al enviar sugerencia.</div>';
    console.error(err);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
  }
});
