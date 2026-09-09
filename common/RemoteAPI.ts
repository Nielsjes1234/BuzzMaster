import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';

export interface RemoteServerInfo {
  ip: string;
  port: number;
  url: string;
}

export type RemoteAPI = RemoteSenderAPI & RemoteReceiverAPI & RemoteServerAPI;

export interface RemoteServerAPI {
  getServerInfo: () => Promise<RemoteServerInfo | null>;
}

export interface RemoteSenderAPI {
  // Host UI sends state/settings to the remote
  updateGameState: (state: GameState | undefined) => void;
  updateGameSettings: (settings: GameSettings) => void;
  updateLocale: (locale: string) => void;
}

type Callback<F> = (callback: F) => void;

export interface RemoteAction {
  action: string;
  payload?: unknown; // Changed 'any' to 'unknown' to fix ESLint error
}

export interface RemoteReceiverAPI {
  // Host UI receives actions from the remote control
  onRemoteAction: Callback<(action: RemoteAction) => void>;
  onServerStatusChange: Callback<(running: boolean) => void>;
}
