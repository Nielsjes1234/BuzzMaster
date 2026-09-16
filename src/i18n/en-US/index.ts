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
    start: 'Start',
    devices: 'Devices',
    leaderboard: 'Leaderboard',
  },

  exit: {
    title: 'Exit Buzz Master',
    message: 'Are you sure you want to quit Buzz Master?',
    action: {
      ok: 'Exit',
      cancel: 'Cancel',
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
