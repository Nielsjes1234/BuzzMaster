import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io, type Socket } from 'socket.io-client';
import { useQuasar } from 'quasar';
import type { RemoteAction } from '@/../common/RemoteAPI';
import type { GameState } from '@/../common/gameState';
import type { GameSettings } from '@/../common/gameSettings';

/**
 * Manages the state and communication for the Remote Control Companion App.
 *
 * Architecture:
 * - When running on the Host (Electron): This store acts as a bridge. It listens to
 *   IPC events via `window.remoteAPI` and dispatches `remote-action` CustomEvents
 *   to the window so the Vue app (like game-store) can react to remote control commands.
 * - When running on the Phone (Remote UI): This store connects directly to the NodeJS
 *   proxy server (running on port 3000) via Socket.IO. It receives state updates
 *   (like `gameState` and `locale`) and emits actions back to the server.
 */
export const useRemoteStore = defineStore('remoteStore', () => {
  const quasar = useQuasar();
  const isHost = quasar.platform.is.electron;

  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);

  const gameState = ref<GameState | undefined>(undefined);
  const gameSettings = ref<GameSettings | undefined>(undefined);
  const locale = ref<string>('en-US');

  /**
   * Initializes the connection depending on the environment.
   * Host: Sets up IPC listeners.
   * Remote: Connects to Socket.IO.
   */
  function connectToRemoteServer() {
    if (isHost) {
      // Host UI doesn't need to connect via socket, it communicates via window.remoteAPI directly
      // But it can listen to remote actions from the main process
      if (typeof window.remoteAPI !== 'undefined') {
        window.remoteAPI.onRemoteAction((action: RemoteAction) => {
          // This will be handled by the game/leaderboard stores by adding their own listeners
          // We can dispatch a custom event on window for loose coupling
          window.dispatchEvent(
            new CustomEvent('remote-action', { detail: action }),
          );
        });
      }
      return;
    }

    // Remote UI connects to the Socket.IO server (which is served by Express on port 3000)
    // Since the Remote UI is hosted on port 3000 (proxied), we can just connect to '/'
    const socketInstance = io();

    socketInstance.on('connect', () => {
      isConnected.value = true;
    });

    socketInstance.on('disconnect', () => {
      isConnected.value = false;
      gameState.value = undefined;
    });

    socketInstance.on('gameState', (state: GameState | undefined) => {
      gameState.value = state;
    });

    socketInstance.on('gameSettings', (settings: GameSettings) => {
      gameSettings.value = settings;
    });

    socketInstance.on('locale', (l: string) => {
      locale.value = l;
    });

    socket.value = socketInstance;
  }

  /**
   * Sends an action from the Remote Control to the Host.
   * Ignored if called on the Host itself.
   */
  function sendRemoteAction(action: string, payload?: unknown) {
    if (isHost) {
      // In host mode, we don't send remote actions (host receives them)
      return;
    }

    if (socket.value && isConnected.value) {
      socket.value.emit('action', { action, payload });
    }
  }

  return {
    connectToRemoteServer,
    sendRemoteAction,
    isConnected,
    gameState,
    gameSettings,
    locale,
  };
});
