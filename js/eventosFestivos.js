// eventosFestivos.js — Manejo de decoraciones según la fecha
document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const dia = hoy.getDate();
  const diaSemana = hoy.getDay();
  const h1 = document.querySelector("h1");

  function setTituloClase(clase) {
    if (h1) h1.className = clase;
  }

  function efectoNieve() {
    for (let i = 0; i < 40; i++) {
      const copo = document.createElement("div");
      copo.className = "nieve-copo";
      copo.style.left = Math.random() * 100 + "vw";
      copo.style.animationDuration = 6 + Math.random() * 5 + "s";
      copo.style.animationDelay = Math.random() * 5 + "s";
      document.body.appendChild(copo);
    }
  }

  function efectoHojas() {
    for (let i = 0; i < 20; i++) {
      const hoja = document.createElement("div");
      hoja.className = "hoja-otoño";
      hoja.style.left = Math.random() * 100 + "vw";
      hoja.style.animationDuration = 8 + Math.random() * 5 + "s";
      hoja.style.animationDelay = Math.random() * 5 + "s";
      document.body.appendChild(hoja);
    }
  }

  function efectoFlores() {
    for (let i = 0; i < 20; i++) {
      const flor = document.createElement("div");
      flor.className = "flor";
      flor.style.left = Math.random() * 100 + "vw";
      flor.style.animationDuration = 7 + Math.random() * 4 + "s";
      flor.style.animationDelay = Math.random() * 3 + "s";
      document.body.appendChild(flor);
    }
  }

  function efectoVelas() {
    for (let i = 0; i < 10; i++) {
      const vela = document.createElement("div");
      vela.className = "vela";
      vela.style.left = Math.random() * 100 + "vw";
      document.body.appendChild(vela);
    }
  }

  function esSegundoDomingoDeMayo(fecha) {
    const dia = fecha.getDate();
    const diaSemana = fecha.getDay();
    return fecha.getMonth() === 4 && diaSemana === 0 && dia >= 8 && dia <= 14;
  }

  // === Eventos ===
  if (mes === 12) {
    setTituloClase("titulo-navidad");
    efectoNieve();
  } else if (mes === 9 && dia === 10) {
    setTituloClase("titulo-dia-nino");
  } else if (mes === 9 && dia === 15) {
    setTituloClase("titulo-independencia");
  } else if (mes === 10 && dia === 31) {
    setTituloClase("titulo-halloween");
  } else if (mes === 11 && diaSemana === 4 && dia + 7 > 30) {
    setTituloClase("titulo-thanksgiving");
    efectoHojas();
  } else if (esSegundoDomingoDeMayo(hoy)) {
    setTituloClase("titulo-madre");
    efectoFlores();
  } else if (mes === 11 && dia === 2) {
    setTituloClase("titulo-muertos");
    efectoVelas();
  }
});