import gameMode from './gameMode';
import devices from './devices';
import leaderboard from './leaderboard';
import batterySaving from './batterySaving';
import cast from './cast';
import updater from './updater';
import toolbar from './toolbar';
import online from './online';
import remote from './remote';

export default {
  app_name: 'BuzzMaster',

  action: {
    start: 'Start',
    devices: 'Geräte',
    leaderboard: 'Rangliste',
  },

  exit: {
    title: 'BuzzMaster beenden',
    message: 'Möchtest du BuzzMaster wirklich schließen?',
    action: {
      ok: 'Beenden',
      cancel: 'Abbrechen',
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
};
