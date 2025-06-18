const SUGERENCIAS_URL = 'https://script.google.com/macros/s/AKfycbxZj7zbD0onrR8VNRj90WkOb5c_zZn_1TJfOWw74Dkr_alVru65XgLj08mT3AjHZPao/exec';

// Obtiene y muestra la lista de sugerencias enviadas
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
  }

  fetch(SUGERENCIAS_URL)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tablaSugerencias tbody');
      tbody.innerHTML = '';

      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No hay sugerencias disponibles.</td></tr>';
        return;
      }

      for (const clave in data) {
        const fila = data[clave];
        const fecha = fila.Timestamp || '-';
        const nombre = fila.Nombre || 'Anónimo';
        const mensaje = fila.Mensaje || fila.Sugerencia || fila[' mensaje'] || fila['Mensaje '] || '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td data-label="Fecha">${fecha}</td>
          <td data-label="Nombre">${nombre}</td>
          <td data-label="Mensaje">${mensaje}</td>`;
        tbody.appendChild(tr);
      }
    })
    .catch(err => { // 🔸 Error al consultar sugerencias
      document.querySelector('#tablaSugerencias tbody').innerHTML =
        '<tr><td colspan="3" style="text-align:center;">❌ Error al cargar sugerencias.</td></tr>';
      console.error('Error al obtener sugerencias:', err);
    });
});
