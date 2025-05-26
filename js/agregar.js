// ✅ agregar.js con ID consecutivo basado en el último ID existente
const URL = 'https://script.google.com/macros/s/AKfycbys4Dq4jSXyKlERG8AwgpDAsT05sttX_73r0a9IgoXtMNMCzwT3QNMaZ6PVZpieIMEi/exec';

async function obtenerUltimoID() {
  try {
    const res = await fetch(URL);
    const data = await res.json();
    const ids = Object.values(data)
      .map(item => parseInt(item.id))
      .filter(id => !isNaN(id));
    const maxID = ids.length ? Math.max(...ids) : 356;
    return maxID + 1;
  } catch (err) {
    console.error("❌ Error obteniendo el último ID", err);
    return Date.now(); // fallback temporal si falla
  }
}

document.getElementById('formulario').addEventListener('submit', async function(e) {
  e.preventDefault();

  const tipo = document.getElementById('tipo').value;
  const termino = document.getElementById('termino').value.trim();
  const traduccion = document.getElementById('traduccion').value.trim();
  const pronunciacion = document.getElementById('pronunciacion').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const definicion = document.getElementById('definicion').value.trim();
  const sinonimos = document.getElementById('sinonimos').value.trim();
  const formaFarmaceutica = tipo === 'forma' ? definicion : '';

  const id = (await obtenerUltimoID()).toString();

  const datos = {
    id,
    termino,
    traduccion,
    pronunciacion,
    categoria,
    definicion,
    sinonimos,
    tipo,
    formaFarmaceutica
  };

  document.getElementById("loader").style.display = "block";

  try {
    const res = await fetch(URL, {
      method: 'POST',
      body: new URLSearchParams(datos),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    document.getElementById("loader").style.display = "none";
    document.getElementById("mensaje").textContent = "✅ Término agregado exitosamente";
    document.getElementById("formulario").reset();
    setTimeout(() => document.getElementById("mensaje").textContent = '', 3000);
  } catch (err) {
    document.getElementById("loader").style.display = "none";
    document.getElementById("mensaje").textContent = "❌ Error al agregar el término";
  }
});

function mostrarCampos() {
  const tipo = document.getElementById("tipo").value;
  const campos = ["traduccion", "pronunciacion", "categoria", "definicion", "sinonimos"];

  campos.forEach(id => document.getElementById(id).style.display = "none");
  if (tipo === "abreviatura") {
    document.getElementById("definicion").style.display = "block";
  } else if (tipo === "termino") {
    campos.forEach(id => document.getElementById(id).style.display = "block");
  } else if (tipo === "forma") {
    document.getElementById("definicion").placeholder = "Definición de forma farmacéutica";
    document.getElementById("definicion").style.display = "block";
  }
}
