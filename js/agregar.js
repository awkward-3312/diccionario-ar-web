window.addEventListener('DOMContentLoaded', () => {
  // ✅ Verifica que Supabase esté cargado correctamente
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase no está disponible. Asegúrate que el script se cargue antes.');
    return;
  }

  // ✅ Configuración Supabase
  const supabaseUrl = 'https://gapivzjnehrkbbnjtvam.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcGl2empuZWhya2Jibmp0dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjkwMzYsImV4cCI6MjA2NDA0NTAzNn0.g7MXXPDzBqssewgHUreA_jNbRl7A_gTvaTv2xXEwHTk';
  const client = window.supabase.createClient(supabaseUrl, supabaseKey);

  function mostrarCampos() {
    const tipo = document.getElementById('tipo').value;
    const campos = {
      traduccion: document.getElementById('traduccion'),
      pronunciacion: document.getElementById('pronunciacion'),
      categoria: document.getElementById('categoria'),
      definicion: document.getElementById('definicion'),
      sinonimos: document.getElementById('sinonimos'),
      forma: document.getElementById('formaFarmaceutica')
    };

    for (let campo in campos) campos[campo].style.display = 'none';

    if (tipo === 'abreviatura') {
      campos.traduccion.style.display = 'block';
    } else if (tipo === 'termino') {
      campos.traduccion.style.display = 'block';
      campos.pronunciacion.style.display = 'block';
      campos.categoria.style.display = 'block';
      campos.definicion.style.display = 'block';
      campos.sinonimos.style.display = 'block';
    } else if (tipo === 'forma') {
      campos.traduccion.style.display = 'block';
      campos.forma.style.display = 'block';
    } else if (tipo === 'instrumento') {
      campos.traduccion.style.display = 'block';
    }
  }

  function toggleLoader(mostrar) {
    document.getElementById('loader').style.display = mostrar ? 'block' : 'none';
    document.querySelectorAll('#formulario button').forEach(btn => btn.disabled = mostrar);
  }

  function mostrarPopup(texto, exito = true) {
    const popup = document.getElementById('popupMsg');
    popup.style.backgroundColor = exito ? '#3ae374' : '#ff5e57';
    popup.innerText = texto;
    popup.style.display = 'block';
    setTimeout(() => popup.style.display = 'none', 3000);
  }

  document.getElementById('tipo').addEventListener('change', mostrarCampos);

  document.getElementById('formulario').addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleLoader(true);

    const tipo = document.getElementById('tipo').value;
    const termino = document.getElementById('termino').value.trim();
    const traduccion = document.getElementById('traduccion').value.trim();
    const pronunciacion = document.getElementById('pronunciacion').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const definicion = document.getElementById('definicion').value.trim();
    const sinonimos = document.getElementById('sinonimos').value.trim();
    const forma = document.getElementById('formaFarmaceutica').value.trim();

    const registro = {
      termino,
      traduccion: traduccion || null,
      tipo_termino:
        tipo === 'termino' ? 'Término' :
        tipo === 'abreviatura' ? 'Abreviatura' :
        tipo === 'forma' ? 'Forma farmacéutica' :
        'Instrumento',
      fecha_agregado: new Date().toISOString()
    };

    if (tipo === 'termino') {
      registro.pronunciacion = pronunciacion || null;
      registro.categoria = categoria || null;
      registro.definicion = definicion || null;
      registro.sinonimos = sinonimos || null;
    }

    if (tipo === 'forma') {
      registro.forma_farmaceutica = forma || null;
    }

    const { error } = await client
      .from('base_datos')
      .insert([registro]);

    toggleLoader(false);

    if (error) {
      console.error(error);
      mostrarPopup('❌ Error al guardar: ' + error.message, false);
    } else {
      mostrarPopup('✅ Término agregado correctamente');
      e.target.reset();
      mostrarCampos();
    }
  });
});
