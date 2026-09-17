import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';
import type { LeaderboardEntry } from '@/../common/gameState/LeaderboardState';

export type CastAPI = CastSenderAPI & CastReceiverAPI & CastWindowAPI;

export interface CastWindowAPI {
  isOpen: () => Promise<boolean>;
  onCastWindowUpdate: (callback: (open: boolean) => void) => void;
}

export interface CastSenderAPI {
  ready: () => void;
  toggle: () => void;
  updateGameState: (state: GameState | undefined) => void;
  updateGameSettings: (settings: GameSettings) => void;
  updateLocale: (locale: string) => void;
  updateControllers: (controllers: Record<string, string>) => void;
  /**
   * The standings, sent independently of `updateGameState`. The leaderboard is
   * a game state of its own, which means the cast window only ever sees it
   * while the host is standing on the leaderboard page; between rounds the
   * screen went blank. This channel carries the scores the way
   * `updateControllers` carries the names: as context that is true whatever
   * game happens to be running.
   */
  updateLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
}

type Callback<F> = (callback: F) => void;
type APICallback<A, K extends keyof A> = Callback<A[K]>;
type CastCallback<K extends keyof CastSenderAPI> = APICallback<
  CastSenderAPI,
  K
>;

export interface CastReceiverAPI {
  onGameStateUpdate: CastCallback<'updateGameState'>;
  onGameSettingsUpdate: CastCallback<'updateGameSettings'>;
  onLocaleUpdate: CastCallback<'updateLocale'>;
  onControllerUpdate: CastCallback<'updateControllers'>;
  onLeaderboardUpdate: CastCallback<'updateLeaderboard'>;
}
