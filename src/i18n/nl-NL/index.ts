import cast from './cast';
import gameMode from './gameMode';
import batterySaving from './batterySaving';
import devices from './devices';
import leaderboard from './leaderboard';
import online from './online';
import toolbar from './toolbar';
import updater from './updater';
import remote from './remote';
import slides from './slides';

export default {
  app_name: 'BuzzMaster',
  action: {
    start: 'Start',
    devices: 'Apparaten',
    leaderboard: 'Scorebord',
  },
  exit: {
    title: 'BuzzMaster Afsluiten',
    message: 'Weet je zeker dat je BuzzMaster wilt afsluiten?',
    action: {
      ok: 'Afsluiten',
      cancel: 'Annuleren',
    },
  },
  cast,
  gameMode,
  batterySaving,
  devices,
  leaderboard,
  online,
  toolbar,
  updater,
  remote,
  slides,
};
