const URL = 'https://script.google.com/macros/s/AKfycbys4Dq4jSXyKlERG8AwgpDAsT05sttX_73r0a9IgoXtMNMCzwT3QNMaZ6PVZpieIMEi/exec';

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

  const datos = {
    termino,
    traduccion,
    pronunciacion,
    categoria,
    definicion,
    sinonimos,
    tipo,
    formaFarmaceutica
    // NOTA: no enviamos "id"
  };

  document.getElementById("loader").style.display = "block";

  try {
    const res = await fetch(URL, {
      method: 'POST',
      body: new URLSearchParams(datos),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const texto = await res.text();
    document.getElementById("loader").style.display = "none";
    document.getElementById("mensaje").textContent = texto.includes("✅")
      ? "✅ Término agregado exitosamente"
      : texto;

    document.getElementById("formulario").reset();
    setTimeout(() => document.getElementById("mensaje").textContent = '', 3000);
  } catch (err) {
    console.error("❌ Error al enviar:", err);
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
