import buzzer from './buzzer';
import quiz from './quiz';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';
import simon from './simon';
import pong from './pong';

export default {
  buzzer,
  quiz,
  stopwatch,
  viewingRate,
  simon,
  pong,

  title: 'Cast',

  standby: {
    title: 'Clasificación',
    waiting: 'Listo cuando quieras',
    more: '+{n} más',
  },

  toolbar: {
    close: 'Cerrar ventana',
    darkMode: 'Modo Oscuro',
    transparent: 'Ventana transparente',
  },
};
