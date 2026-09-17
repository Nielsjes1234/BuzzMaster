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
    title: 'Punktestand',
    waiting: 'Bereit, wenn du es bist',
    more: '+{n} weitere',
  },

  toolbar: {
    close: 'Fenster schließen',
    darkMode: 'Dunkelmodus umschalten',
    transparent: 'Transparentes Fenster',
  },
};
