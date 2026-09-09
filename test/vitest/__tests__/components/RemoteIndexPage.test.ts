import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { installQuasarPlugin } from '../../install-quasar';
import RemoteIndexPage from '@/pages/RemoteIndexPage.vue';
import { createTestingPinia } from '@pinia/testing';
import { useRemoteStore } from '@/stores/remote-store';
import type { GameState } from '@/../common/gameState';

installQuasarPlugin();

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, args?: Record<string, string>) => {
      if (args && args.game) {
        return `${key} ${args.game}`;
      }
      return key;
    },
  }),
}));

vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('quasar')>();
  return {
    ...actual,
    useQuasar: vi.fn(() => ({
      platform: { is: { electron: false } },
    })),
  };
});

describe('RemoteIndexPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mountPage = () => {
    return mount(RemoteIndexPage, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
          }),
        ],
      },
    });
  };

  it('shows waiting for connection state', () => {
    const wrapper = mountPage();
    const store = useRemoteStore();

    expect(store.connectToRemoteServer).toHaveBeenCalled();
    expect(wrapper.text()).toContain('remote.status.waiting');
  });

  it('shows main menu when connected with no game', async () => {
    const wrapper = mountPage();
    const store = useRemoteStore();

    // Simulate connection
    store.isConnected = true;
    store.gameState = undefined;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('remote.menu.noGame');
    expect(wrapper.text()).toContain('remote.action.quiz');

    // Click Quiz button
    const quizBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('remote.action.quiz'));
    expect(quizBtn).toBeDefined();
    await quizBtn?.trigger('click');

    expect(store.sendRemoteAction).toHaveBeenCalledWith(
      'router:push',
      '/gameModes/quiz',
    );
  });

  it('shows quiz controls when quiz game is active', async () => {
    const wrapper = mountPage();
    const store = useRemoteStore();

    store.isConnected = true;
    store.gameState = { game: 'quiz', name: 'preparing' } as GameState;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('remote.action.startQuiz');

    const startBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('remote.action.startQuiz'));
    await startBtn?.trigger('click');

    expect(store.sendRemoteAction).toHaveBeenCalledWith(
      'quiz:start',
      undefined,
    );
  });

  it('shows buzzer controls when buzzer game is active', async () => {
    const wrapper = mountPage();
    const store = useRemoteStore();

    store.isConnected = true;
    store.gameState = { game: 'buzzer', name: 'running' } as GameState;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('remote.action.resetBuzzers');

    const resetBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('remote.action.resetBuzzers'));
    await resetBtn?.trigger('click');

    expect(store.sendRemoteAction).toHaveBeenCalledWith(
      'buzzer:restart',
      undefined,
    );
  });
});
