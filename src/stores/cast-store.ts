import { acceptHMRUpdate, defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import type { GameState } from '@/../common/gameState';
import { useRouter } from 'vue-router';
import type { GameSettings } from '@/../common/gameSettings';
import type { LeaderboardEntry } from '@/../common/gameState/LeaderboardState';

export const useCastStore = defineStore('cast', () => {
  const { locale } = useI18n();
  const router = useRouter();

  const gameState = ref<GameState>();
  function updateGameState(state: GameState | undefined) {
    const changeRoute = gameState.value?.game !== state?.game;

    if (changeRoute) {
      // Always to via index page to avoid state conflicts
      void router.push({ name: 'cast' });
    }

    gameState.value = state;

    // Route to next page if needed
    if (!changeRoute || state === undefined) {
      return;
    }

    const routeName = `cast-${state.game}`;
    if (!router.hasRoute(routeName)) {
      return;
    }

    void router.push({ name: routeName });
  }

  const gameSettings = ref<GameSettings>({} as GameSettings);
  function updateGameSettings(settings: GameSettings) {
    gameSettings.value = settings;
  }

  const controllers = ref<Record<string, string>>({});
  function updateControllers(value: Record<string, string>) {
    controllers.value = value;
  }

  /*
   * The standings arrive on their own channel rather than inside `gameState`,
   * so they stay available between rounds instead of only while the host is
   * looking at the leaderboard page.
   */
  const leaderboard = ref<LeaderboardEntry[]>([]);
  function updateLeaderboard(value: LeaderboardEntry[]) {
    leaderboard.value = value;
  }

  function updateLocale(value: string) {
    locale.value = value;
  }

  return {
    controllers,
    gameState,
    gameSettings,
    leaderboard,

    updateGameState,
    updateGameSettings,
    updateLocale,
    updateControllers,
    updateLeaderboard,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCastStore, import.meta.hot));
}
