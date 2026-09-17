import buzzer from './buzzer';
import pong from './pong';
import quiz from './quiz';
import simon from './simon';
import stopwatch from './stopwatch';
import viewingRate from './viewingRate';

export default {
  title: 'Cast',
  standby: {
    title: 'Stand',
    waiting: 'Klaar voor de start',
    more: '+{n} meer',
  },

  toolbar: {
    close: 'Venster sluiten',
    darkMode: 'Donkere modus in-/uitschakelen',
    transparent: 'Transparant venster',
  },
  buzzer,
  pong,
  quiz,
  simon,
  stopwatch,
  viewingRate,
};
