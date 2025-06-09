// eventosFestivos.js - Muestra decoraciones festivas según la fecha actual

(function() {
  'use strict';

  /**
   * Listado de eventos festivos. Cada evento contiene:
   * - nombre: identificador
   * - dia: día de inicio del evento
   * - mes: mes del evento (1-12)
   * - hastaDia: día de finalización opcional para rangos
   * - icono: clase Font Awesome para mostrar
   * - mensaje: texto a mostrar
   */
  const eventos = [
    {
      nombre: 'ar-test-day',
      dia: 9,
      mes: 6,
      icono: 'fa-flask',
      mensaje: '✨ AR Test Day Active!'
    },
    {
      nombre: 'ano-nuevo',
      dia: 1,
      mes: 1,
      icono: 'fa-champagne-glasses',
      mensaje: '¡Feliz Año Nuevo!'
    },
    {
      nombre: 'san-valentin',
      dia: 14,
      mes: 2,
      icono: 'fa-heart',
      mensaje: '¡Feliz Día de San Valentín!'
    },
    {
      nombre: 'dia-mujer',
      dia: 8,
      mes: 3,
      icono: 'fa-venus',
      mensaje: '¡Feliz Día Internacional de la Mujer!'
    },
    {
      nombre: 'dia-trabajo',
      dia: 1,
      mes: 5,
      icono: 'fa-briefcase',
      mensaje: '¡Feliz Día del Trabajo!'
    },
    {
      nombre: 'independencia-hn',
      dia: 15,
      mes: 9,
      icono: 'fa-flag',
      mensaje: '¡Feliz Independencia de Honduras!'
    },
    {
      nombre: 'dia-farmaceutico',
      dia: 25,
      mes: 9,
      icono: 'fa-pills',
      mensaje: '¡Feliz Día del Farmacéutico!'
    },
    {
      nombre: 'halloween',
      dia: 31,
      mes: 10,
      icono: 'fa-ghost',
      mensaje: '¡Feliz Halloween!'
    },
    {
      nombre: 'thanksgiving',
      dia: 28,
      mes: 11,
      icono: 'fa-wheat-awn',
      mensaje: '¡Feliz Día de Acción de Gracias!'
    },
    {
      nombre: 'navidad',
      dia: 1,
      mes: 12,
      hastaDia: 31,
      icono: 'fa-tree',
      mensaje: '¡Feliz Navidad!'
    }
  ];

  /**
   * Busca un evento que coincida con la fecha proporcionada.
   * @param {Date} fecha
   * @returns {Object|undefined}
   */
  function obtenerEventoParaFecha(fecha) {
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    return eventos.find(evt => {
      if (evt.mes !== mes) return false;
      if (evt.hastaDia) {
        return dia >= evt.dia && dia <= evt.hastaDia;
      }
      return dia === evt.dia;
    });
  }

  /**
   * Genera y muestra la decoración festiva en pantalla.
   * @param {Object} evento
   */
  function mostrarDecoracion(evento) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay-festivo';

    const popup = document.createElement('div');
    popup.className = 'popup-festivo';

    const cerrar = document.createElement('button');
    cerrar.className = 'cerrar-festivo';
    cerrar.innerHTML = '&times;';
    cerrar.addEventListener('click', () => overlay.remove());
    popup.appendChild(cerrar);

    const icono = document.createElement('i');
    icono.className = `fa-solid ${evento.icono}`;
    popup.appendChild(icono);

    const texto = document.createElement('span');
    texto.textContent = evento.mensaje;
    popup.appendChild(texto);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    setTimeout(() => overlay.remove(), 5000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const eventoHoy = obtenerEventoParaFecha(new Date());
    if (eventoHoy) {
      mostrarDecoracion(eventoHoy);
    }
  });
})();
