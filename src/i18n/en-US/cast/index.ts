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
  pong,
  simon,

  title: 'Cast',

  standby: {
    title: 'Standings',
    waiting: 'Ready when you are',
    more: '+{n} more',
  },

  toolbar: {
    close: 'Close Window',
    darkMode: 'Toggle Dark Mode',
    transparent: 'Transparent Window',
  },
};
