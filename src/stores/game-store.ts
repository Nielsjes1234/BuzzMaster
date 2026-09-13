import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';
import type { GameState } from '@/../common/gameState';
import type { RemoteAction } from '@/../common/RemoteAPI';

class StateTransitionError extends Error {
  constructor(state: GameState, prevState: GameState) {
    super(`Invalid transition from ${prevState.game} to ${state.game}`);
  }
}

export const useGameStore = defineStore('game-store', () => {
  const state = ref<GameState>();
  let lastSentState: string | undefined = undefined;

  function transition(gameState: GameState) {
    if (state.value !== undefined && state.value?.game !== gameState.game) {
      const prevState = state.value;
      // This should be an illegal transition.
      // Transitions between games should always be after a reset.
      // Reset it manually to allow state triggers to take action.
      state.value = undefined;

      throw new StateTransitionError(prevState, gameState);
    }

    state.value = { ...gameState };

    if (
      typeof window !== 'undefined' &&
      typeof window.remoteAPI !== 'undefined' &&
      window.remoteAPI
    ) {
      // Strip high-frequency fields (time) before sending over IPC 
      // to avoid IPC flooding. We use JSON.stringify for a very fast 
      // deep equality check and serialization, avoiding lodash overhead.
      // Note: We use the raw incoming `gameState` here rather than `state.value`
      // to avoid triggering heavy Vue proxy tracking 60 times a second.
      const strippedState = { ...gameState } as Record<string, unknown>;
      delete strippedState.time;
      const serialized = JSON.stringify(strippedState);
      
      if (serialized !== lastSentState) {
        lastSentState = serialized;
        window.remoteAPI.updateGameState(JSON.parse(serialized));
      }
    }
  }

  function reset() {
    state.value = undefined;

    if (
      typeof window !== 'undefined' &&
      typeof window.remoteAPI !== 'undefined' &&
      window.remoteAPI &&
      lastSentState !== undefined
    ) {
      lastSentState = undefined;
      window.remoteAPI.updateGameState(undefined);
    }
  }

  // Handle incoming remote actions
  if (typeof window !== 'undefined') {
    window.addEventListener('remote-action', ((
      e: CustomEvent<RemoteAction>,
    ) => {
      const { action, payload } = e.detail;
      if (action === 'gameStore:transition') {
        transition(payload as GameState);
      } else if (action === 'gameStore:reset') {
        reset();
      }
    }) as EventListener);
  }

  return {
    state,

    transition,
    reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot));
}
