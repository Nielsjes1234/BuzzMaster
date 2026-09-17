import gameMode from './gameMode';
import devices from './devices';
import leaderboard from './leaderboard';
import batterySaving from './batterySaving';
import cast from './cast';
import updater from './updater';
import toolbar from './toolbar';
import online from './online';
import remote from './remote';
import slides from './slides';

export default {
  app_name: 'BuzzMaster',

  action: {
    start: 'Empezar',
    devices: 'Dispositivos',
    leaderboard: 'Clasificación',
  },

  exit: {
    title: 'Salir de BuzzMaster',
    message: '¿Estás seguro que quieres salir de BuzzMaster?',
    action: {
      ok: 'Salir',
      cancel: 'Cancelar',
    },
  },

  cast,
  batterySaving,
  devices,
  gameMode,
  leaderboard,

  toolbar,
  updater,
  online,
  remote,
  slides,
};
